import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import sharp from 'sharp';
import { createRawMovie } from './database';

// Rate limiting configuration
const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds between retries

// Progress tracking interface
export interface ScrapingProgress {
  total: number;
  completed: number;
  failed: number;
  currentUrl?: string;
  status: 'idle' | 'running' | 'completed' | 'error';
}

// Movie data interface
export interface MovieData {
  title: string;
  url: string;
  description: string;
  image_url: string;
  image_data?: string;
  release_date: string;
  genre: string;
  rating?: string;
  duration?: string;
  director?: string;
  quality?: string;
  size?: string;
  language?: string;
  status: 'active' | 'pending';
}

// Scraper class with rate limiting and retry logic
export class MovieScraper {
  private lastRequestTime = 0;
  private progressCallback?: (progress: ScrapingProgress) => void;

  constructor(progressCallback?: (progress: ScrapingProgress) => void) {
    this.progressCallback = progressCallback;
  }

  // Rate limiting helper
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      const delay = RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  // Retry mechanism for failed requests
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries = MAX_RETRIES
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0) {
        console.log(`Request failed, retrying in ${RETRY_DELAY}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.retryRequest(requestFn, retries - 1);
      }
      throw error;
    }
  }

  // Fetch HTML content with rate limiting and retry
  private async fetchHTML(url: string): Promise<string> {
    await this.rateLimit();
    
    return this.retryRequest(async () => {
      const response: AxiosResponse<string> = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 30000, // 30 seconds timeout
      });
      return response.data;
    });
  }

  // Extract movie details from individual movie page
  async extractMovieDetails(movieUrl: string): Promise<MovieData | null> {
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Starting extraction for URL: ${movieUrl} (attempt ${attempt}/${maxRetries})`);
        
        const html = await this.fetchHTML(movieUrl);
        if (!html || html.trim().length === 0) {
          throw new Error('Empty HTML content received');
        }
        
        const $ = cheerio.load(html);
        
        // Validate that we have a proper HTML document
        if ($('body').length === 0) {
          throw new Error('Invalid HTML structure - no body element found');
        }
        
        // Extract all movie data fields with error handling for each
        const extractionResults = {
          title: this.truncateText(this.safeExtract(() => this.extractTitle($), 'Unknown Movie'), 255),
          description: this.safeExtract(() => this.extractDescription($), 'No description available'),
          imageUrl: this.safeExtract(() => this.extractImageUrl($, movieUrl), 'https://via.placeholder.com/300x450?text=No+Image'),
          releaseDate: this.truncateText(this.safeExtract(() => this.extractReleaseDate($), 'Unknown'), 50),
          genre: this.safeExtract(() => this.extractGenre($), 'Unknown'),
          rating: this.truncateText(this.safeExtract(() => this.extractRating($), 'Unknown'), 20),
          duration: this.truncateText(this.safeExtract(() => this.extractDuration($), 'Unknown'), 50),
          director: this.truncateText(this.safeExtract(() => this.extractDirector($), 'Unknown'), 200),
          cast: this.safeExtract(() => this.extractCast($), 'Unknown'), // TEXT field, no length limit
          quality: this.truncateText(this.safeExtract(() => this.extractQuality($), 'Unknown'), 50),
          size: this.truncateText(this.safeExtract(() => this.extractSize($), 'Unknown'), 50),
          language: this.truncateText(this.safeExtract(() => this.extractLanguage($), 'Unknown'), 100)
        };
        
        // Validate that we extracted at least a title
        if (!extractionResults.title || extractionResults.title === 'Unknown Movie') {
          throw new Error('Failed to extract movie title - possibly invalid page');
        }
        
        console.log('Extraction completed successfully');
        console.log('Extracted data summary:', {
          title: extractionResults.title,
          hasDescription: extractionResults.description !== 'No description available',
          hasImage: extractionResults.imageUrl !== 'https://via.placeholder.com/300x450?text=No+Image',
          genre: extractionResults.genre,
          rating: extractionResults.rating
        });
        
        return {
          title: extractionResults.title,
          url: movieUrl,
          description: extractionResults.description,
          image_url: extractionResults.imageUrl,
          release_date: extractionResults.releaseDate,
          genre: extractionResults.genre,
          rating: extractionResults.rating,
          duration: extractionResults.duration,
          director: extractionResults.director,
          cast: extractionResults.cast,
          quality: extractionResults.quality,
          size: extractionResults.size,
          language: extractionResults.language,
          status: 'active'
        };
      } catch (error) {
        lastError = error as Error;
        console.error(`Error extracting movie details from ${movieUrl} (attempt ${attempt}/${maxRetries}):`, error);
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`Failed to extract movie details after ${maxRetries} attempts:`, lastError);
    return null;
  }
  
  private safeExtract<T>(extractFn: () => T, fallback: T): T {
    try {
      const result = extractFn();
      return result !== null && result !== undefined ? result : fallback;
    } catch (error) {
      console.warn('Extraction function failed:', error);
      return fallback;
    }
  }

  // Helper methods for extracting specific data fields using text pattern matching only
  private extractTitle($: cheerio.CheerioAPI): string {
    // Try multiple sources for title extraction
    let title = '';
    
    // 1. Try Open Graph title
    title = $('meta[property="og:title"]').attr('content') || '';
    if (title) return title.trim();
    
    // 2. Try page title (remove site name)
    title = $('title').text().replace(/\s*[-|]\s*[^-|]*$/, '').trim();
    if (title) return title;
    
    // 3. Try first h1 heading
    title = $('h1').first().text().trim();
    if (title) return title;
    
    // 4. Try structured data
    const jsonLd = $('script[type="application/ld+json"]').text();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data.name) return data.name;
        if (data.headline) return data.headline;
      } catch (e) {}
    }
    
    return 'Unknown Movie';
  }

  private extractDescription($: cheerio.CheerioAPI): string {
    // Try multiple sources for description
    let description = '';
    
    // 1. Try Open Graph description
    description = $('meta[property="og:description"]').attr('content') || '';
    if (description && description.length > 20) return description.trim();
    
    // 2. Try meta description
    description = $('meta[name="description"]').attr('content') || '';
    if (description && description.length > 20) return description.trim();
    
    // 3. Try structured data
    const jsonLd = $('script[type="application/ld+json"]').text();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data.description) return data.description;
      } catch (e) {}
    }
    
    // 4. Look for story/plot sections
    const storySelectors = [
      '.story', '.plot', '.synopsis', '.description',
      '[class*="story"]', '[class*="plot"]', '[class*="synopsis"]'
    ];
    
    for (const selector of storySelectors) {
      const text = $(selector).text().trim();
      if (text && text.length > 50) return text;
    }
    
    // 5. Try first substantial paragraph
    const paragraphs = $('p').toArray();
    for (const p of paragraphs) {
      const text = $(p).text().trim();
      if (text && text.length > 50) return text;
    }
    
    return 'No description available';
  }

  private extractImageUrl($: cheerio.CheerioAPI, baseUrl: string): string {
    // Try multiple sources for image extraction
    
    // 1. Try Open Graph image
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage && this.isValidImageUrl(ogImage)) {
      return ogImage.startsWith('http') ? ogImage : new URL(ogImage, baseUrl).href;
    }
    
    // 2. Try Twitter card image
    const twitterImage = $('meta[name="twitter:image"]').attr('content');
    if (twitterImage && this.isValidImageUrl(twitterImage)) {
      return twitterImage.startsWith('http') ? twitterImage : new URL(twitterImage, baseUrl).href;
    }
    
    // 3. Try structured data
    const jsonLd = $('script[type="application/ld+json"]').text();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data.image) {
          const image = Array.isArray(data.image) ? data.image[0] : data.image;
          const imageUrl = typeof image === 'string' ? image : image.url;
          if (imageUrl && this.isValidImageUrl(imageUrl)) {
            return imageUrl.startsWith('http') ? imageUrl : new URL(imageUrl, baseUrl).href;
          }
        }
      } catch (e) {}
    }
    
    // 4. Try common poster/thumbnail selectors
    const imageSelectors = [
      '.poster img', '.thumbnail img', '.movie-poster img',
      '.cover img', '.featured-image img',
      '[class*="poster"] img', '[class*="thumbnail"] img',
      '[class*="cover"] img'
    ];
    
    for (const selector of imageSelectors) {
      const src = $(selector).attr('src');
      if (src && this.isValidImageUrl(src)) {
        return src.startsWith('http') ? src : new URL(src, baseUrl).href;
      }
    }
    
    // 5. Try any substantial image
    const images = $('img').toArray();
    for (const img of images) {
      const src = $(img).attr('src');
      if (src && this.isValidImageUrl(src)) {
        // Check if image seems substantial (not icon/logo)
        const alt = $(img).attr('alt') || '';
        const className = $(img).attr('class') || '';
        if (!alt.toLowerCase().includes('logo') && !className.toLowerCase().includes('logo')) {
          return src.startsWith('http') ? src : new URL(src, baseUrl).href;
        }
      }
    }
    
    return 'https://via.placeholder.com/300x450?text=No+Image';
  }
  
  private isValidImageUrl(url: string): boolean {
    if (!url) return false;
    // Check if it's a valid image URL
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
    const hasImageExtension = imageExtensions.test(url);
    const isDataUrl = url.startsWith('data:image/');
    const isHttpUrl = url.startsWith('http');
    
    return (hasImageExtension || isDataUrl) && (isHttpUrl || isDataUrl);
  }

  private extractReleaseDate($: cheerio.CheerioAPI): string {
    // Try multiple patterns for release date extraction
    const pageText = $('body').text();
    
    // 1. Try structured data first
    const jsonLd = $('script[type="application/ld+json"]').text();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data.datePublished) return data.datePublished;
        if (data.releaseDate) return data.releaseDate;
      } catch (e) {}
    }
    
    // 2. Try various text patterns
    const patterns = [
      /Release Date[s]?:\s*([^\n\r\|]+)/i,
      /Released[:\s]+([^\n\r\|]+)/i,
      /Date[:\s]+([^\n\r\|]+)/i,
      /Year[:\s]+(\d{4})/i,
      /\b(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})\b/,
      /\b(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})\b/,
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/i,
      /\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}/i
    ];
    
    for (const pattern of patterns) {
      const match = pageText.match(pattern);
      if (match) {
        const date = match[1].trim();
        if (date && date.length > 3) {
          console.log('Extracted release date from text pattern:', date);
          return date;
        }
      }
    }
    
    // 3. Try common date selectors
    const dateSelectors = [
      '.release-date', '.date', '.year',
      '[class*="release"]', '[class*="date"]'
    ];
    
    for (const selector of dateSelectors) {
      const text = $(selector).text().trim();
      if (text && (/\d{4}|\d{1,2}[\/-]\d{1,2}/.test(text))) {
        console.log('Extracted release date from selector:', text);
        return text;
      }
    }
    
    console.log('Release date extraction result: Unknown');
    return 'Unknown';
  }



  // Helper method to truncate text to fit database constraints
  private truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }

  // Helper method to clean and truncate genre
  private cleanGenre(genre: string): string {
    if (!genre || genre === 'Unknown') {
      return 'Unknown';
    }
    
    // Clean up common issues
    let cleaned = genre
      .replace(/^▾/, '') // Remove dropdown arrow
      .replace(/([a-z])([A-Z])/g, '$1, $2') // Add commas between camelCase words
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Truncate to fit database constraint (100 characters for genre)
    return this.truncateText(cleaned, 100);
  }

  private extractGenre($: cheerio.CheerioAPI): string {
    // Try multiple patterns for genre extraction
    const pageText = $('body').text();
    
    // 1. Try structured data first
    const jsonLd = $('script[type="application/ld+json"]').text();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data.genre) {
          const genre = Array.isArray(data.genre) ? data.genre.join(', ') : data.genre;
          return this.cleanGenre(genre);
        }
      } catch (e) {}
    }
    
    // 2. Try various text patterns
    const patterns = [
      /Genre[s]?:\s*([^\n\r\|]+)/i,
      /Category[s]?:\s*([^\n\r\|]+)/i,
      /Type:\s*([^\n\r\|]+)/i,
      /\bGenre[s]?[:\s]+([^\n\r\|]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = pageText.match(pattern);
      if (match) {
        const genre = match[1].trim().replace(/[,\s]+$/, '');
        if (genre && genre.length > 2) {
          console.log('Extracted genre from text pattern:', genre);
          return this.cleanGenre(genre);
        }
      }
    }
    
    // 3. Try common genre selectors
    const genreSelectors = [
      '.genre', '.category', '.tags',
      '[class*="genre"]', '[class*="category"]'
    ];
    
    for (const selector of genreSelectors) {
      const text = $(selector).text().trim();
      if (text && text.length > 2) {
        console.log('Extracted genre from selector:', text);
        return this.cleanGenre(text);
      }
    }
    
    console.log('Genre extraction result: Unknown');
    return 'Unknown';
  }

  private extractRating($: cheerio.CheerioAPI): string {
    // Try multiple patterns for rating extraction
    const pageText = $('body').text();
    
    // 1. Try structured data first
    const jsonLd = $('script[type="application/ld+json"]').text();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data.aggregateRating && data.aggregateRating.ratingValue) {
          return `${data.aggregateRating.ratingValue}/10`;
        }
        if (data.contentRating) {
          return data.contentRating;
        }
      } catch (e) {}
    }
    
    // 2. Try various text patterns
    const patterns = [
      /Rating[s]?:\s*([^\n\r\|]+)/i,
      /IMDb[\s:]+(\d+\.\d+)/i,
      /Score[s]?:\s*([^\n\r\|]+)/i,
      /\b(\d+\.\d+)\s*\/\s*10/i,
      /\b(\d+\.\d+)\s*stars?/i,
      /\bRated[:\s]+(PG-13|R|PG|G|NC-17)/i
    ];
    
    for (const pattern of patterns) {
      const match = pageText.match(pattern);
      if (match) {
        const rating = match[1].trim();
        if (rating && rating.length > 0) {
          console.log('Extracted rating from text pattern:', rating);
          return rating;
        }
      }
    }
    
    // 3. Try common rating selectors
    const ratingSelectors = [
      '.rating', '.score', '.imdb-rating',
      '[class*="rating"]', '[class*="score"]'
    ];
    
    for (const selector of ratingSelectors) {
      const text = $(selector).text().trim();
      if (text && /\d/.test(text)) {
        console.log('Extracted rating from selector:', text);
        return text;
      }
    }
    
    console.log('Rating extraction result: Unknown');
    return 'Unknown';
  }

  private extractDuration($: cheerio.CheerioAPI): string {
    // Try multiple patterns for duration extraction
    const pageText = $('body').text();
    
    // 1. Try structured data first
    const jsonLd = $('script[type="application/ld+json"]').text();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data.duration) {
          // Convert ISO 8601 duration to readable format
          const duration = data.duration.replace(/PT(\d+)H(\d+)M/, '$1h $2m').replace(/PT(\d+)M/, '$1m');
          return duration;
        }
      } catch (e) {}
    }
    
    // 2. Try various text patterns
    const patterns = [
      /Duration[s]?:\s*([^\n\r\|]+)/i,
      /Runtime[s]?:\s*([^\n\r\|]+)/i,
      /Length[s]?:\s*([^\n\r\|]+)/i,
      /\b(\d+)\s*h(?:ours?)?\s*(\d+)?\s*m(?:in(?:utes?)?)?/i,
      /\b(\d+)\s*m(?:in(?:utes?)?)/i,
      /\b(\d+:\d+)\s*(?:h|hours?)/i
    ];
    
    for (const pattern of patterns) {
      const match = pageText.match(pattern);
      if (match) {
        let duration = match[1] ? match[1].trim() : match[0].trim();
        if (duration && duration.length > 0) {
          // Normalize duration format
          if (match[2]) {
            duration = `${match[1]}h ${match[2]}m`;
          }
          console.log('Extracted duration from text pattern:', duration);
          return duration;
        }
      }
    }
    
    // 3. Try common duration selectors
    const durationSelectors = [
      '.duration', '.runtime', '.length',
      '[class*="duration"]', '[class*="runtime"]'
    ];
    
    for (const selector of durationSelectors) {
      const text = $(selector).text().trim();
      if (text && (/\d+\s*[hm]|\d+:\d+/.test(text))) {
        console.log('Extracted duration from selector:', text);
        return text;
      }
    }
    
    console.log('Duration extraction result: Unknown');
    return 'Unknown';
  }

  private extractDirector($: cheerio.CheerioAPI): string {
    // Try multiple patterns for director extraction
    const pageText = $('body').text();
    
    // 1. Try structured data first
    const jsonLd = $('script[type="application/ld+json"]').text();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data.director) {
          const director = Array.isArray(data.director) ? data.director.map(d => d.name || d).join(', ') : (data.director.name || data.director);
          return director;
        }
      } catch (e) {}
    }
    
    // 2. Try various text patterns
    const patterns = [
      /Director[s]?:\s*([^\n\r\|]+)/i,
      /Directed by:\s*([^\n\r\|]+)/i,
      /\bDirector[s]?[:\s]+([^\n\r\|]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = pageText.match(pattern);
      if (match) {
        const director = match[1].trim().replace(/[,\s]+$/, '');
        if (director && director.length > 2) {
          console.log('Extracted director from text pattern:', director);
          return director;
        }
      }
    }
    
    console.log('Director extraction result: Unknown');
    return 'Unknown';
  }

  private extractCast($: cheerio.CheerioAPI): string {
    // Try multiple patterns for cast extraction
    const pageText = $('body').text();
    
    // 1. Try structured data first
    const jsonLd = $('script[type="application/ld+json"]').text();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data.actor) {
          const cast = Array.isArray(data.actor) ? data.actor.map(a => a.name || a).join(', ') : (data.actor.name || data.actor);
          return cast;
        }
      } catch (e) {}
    }
    
    // 2. Try various text patterns
    const patterns = [
      /Cast:\s*([^\n\r\|]+)/i,
      /Stars?:\s*([^\n\r\|]+)/i,
      /Starring:\s*([^\n\r\|]+)/i,
      /Actors?:\s*([^\n\r\|]+)/i,
      /\bCast[:\s]+([^\n\r\|]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = pageText.match(pattern);
      if (match) {
        const cast = match[1].trim().replace(/[,\s]+$/, '');
        if (cast && cast.length > 2) {
          console.log('Extracted cast from text pattern:', cast);
          return cast;
        }
      }
    }
    
    // 3. Try common cast selectors
    const castSelectors = [
      '.cast', '.actors', '.stars',
      '[class*="cast"]', '[class*="actor"]', '[class*="star"]'
    ];
    
    for (const selector of castSelectors) {
      const text = $(selector).text().trim();
      if (text && text.length > 2) {
        console.log('Extracted cast from selector:', text);
        return text;
      }
    }
    
    console.log('Cast extraction result: Unknown');
    return 'Unknown';
  }

  private extractQuality($: cheerio.CheerioAPI): string {
    // Look for "Quality:" text pattern
    const pageText = $('body').text();
    const match = pageText.match(/Quality:\s*([^\n\r]+)/);
    
    if (match) {
      return match[1].trim();
    }
    
    return 'Not extracted';
  }

  private extractSize($: cheerio.CheerioAPI): string {
    // Look for "Size:" text pattern
    const pageText = $('body').text();
    const match = pageText.match(/Size:\s*([^\n\r]+)/);
    
    if (match) {
      return match[1].trim();
    }
    
    return 'Not extracted';
  }

  private extractLanguage($: cheerio.CheerioAPI): string {
    // Look for "Language:" text pattern
    const pageText = $('body').text();
    const match = pageText.match(/Language:\s*([^\n\r]+)/);
    
    if (match) {
      return match[1].trim();
    }
    
    return 'Hindi';
  }

  // Process individual movie URLs extracted by sitemap parser
  async processMovieUrls(
    movieUrls: string[],
    sitemapId: number
  ): Promise<{ success: number; failed: number; movies: MovieData[] }> {
    console.log(`Starting movie processing: ${movieUrls.length} URLs`);
    
    const progress: ScrapingProgress = {
      total: movieUrls.length,
      completed: 0,
      failed: 0,
      status: 'running'
    };

    this.progressCallback?.(progress);

    const scrapedMovies: MovieData[] = [];

    try {
      // Process each movie URL
      for (const movieUrl of movieUrls) {
        progress.currentUrl = movieUrl;
        this.progressCallback?.(progress);

        try {
          const movieData = await this.extractMovieDetails(movieUrl);
          
          if (movieData) {
            // Download and process image if available
            let imageData: string | null = null;
            if (movieData.image_url && movieData.image_url !== 'https://via.placeholder.com/300x450?text=No+Image') {
              imageData = await this.downloadAndProcessImage(movieData.image_url, movieData.title);
            }
            
            // Save to database with image data
            try {
              await createRawMovie({
                ...movieData,
                image_data: imageData,
                scraped_from: sitemapId
              });
              
              scrapedMovies.push(movieData);
              progress.completed++;
              console.log(`Successfully scraped: ${movieData.title}`);
            } catch (dbError) {
              console.error(`Database error for ${movieData.title}:`, dbError);
              progress.failed++;
            }
          } else {
            progress.failed++;
          }
        } catch (error) {
          console.error(`Failed to process ${movieUrl}:`, error);
          progress.failed++;
        }

        this.progressCallback?.(progress);
      }

      progress.status = 'completed';
      this.progressCallback?.(progress);

      console.log(`Processing completed: ${progress.completed} successful, ${progress.failed} failed`);
      
      return {
        success: progress.completed,
        failed: progress.failed,
        movies: scrapedMovies
      };
    } catch (error) {
      console.error('Error during movie processing:', error);
      progress.status = 'error';
      this.progressCallback?.(progress);
      throw error;
    }
  }

  // Legacy method - kept for backward compatibility but now uses sitemap parser approach
  async scrapeMovies(
    sitemapUrl: string,
    numberOfPosts: number,
    sitemapId: number
  ): Promise<{ success: number; failed: number; movies: MovieData[] }> {
    console.log(`Legacy scraping method called. Use processMovieUrls() with sitemap parser instead.`);
    
    const progress: ScrapingProgress = {
      total: 0,
      completed: 0,
      failed: 0,
      status: 'completed'
    };

    this.progressCallback?.(progress);
    return { success: 0, failed: 0, movies: [] };
  }

  // Download and process image
  async downloadAndProcessImage(imageUrl: string, movieTitle: string): Promise<string | null> {
    try {
      await this.rateLimit();
      
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      // Process image with Sharp
      const processedImage = await sharp(response.data)
        .resize(300, 450, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Convert to base64 for database storage
      const base64Image = `data:image/jpeg;base64,${processedImage.toString('base64')}`;
      
      return base64Image;
    } catch (error) {
      console.error(`Failed to download/process image for ${movieTitle}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const movieScraper = new MovieScraper();