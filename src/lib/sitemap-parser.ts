import { CreateExtractedMovieData } from './database';

export interface ParsedSitemapMovie {
  title: string;
  url: string;
}

/**
 * Fetches and parses a sitemap to extract movie URLs and titles
 */
export async function parseSitemapForMovies(sitemapUrl: string): Promise<ParsedSitemapMovie[]> {
  try {
    console.log(`Fetching sitemap: ${sitemapUrl}`);
    
    const response = await fetch(sitemapUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
    }

    const content = await response.text();
    console.log(`Sitemap content length: ${content.length}`);

    // Check if content is XML (sitemap format)
    if (content.trim().startsWith('<?xml') || content.includes('<urlset') || content.includes('<sitemapindex')) {
      return parseXmlSitemap(content);
    } else {
      // Try parsing as HTML page
      return parseHtmlForMovieLinks(content);
    }
  } catch (error) {
    console.error('Error parsing sitemap:', error);
    throw error;
  }
}

/**
 * Parses XML sitemap content to extract movie URLs
 */
function parseXmlSitemap(xmlContent: string): ParsedSitemapMovie[] {
  const movies: ParsedSitemapMovie[] = [];
  
  try {
    // Extract URLs from XML sitemap
    const urlMatches = xmlContent.match(/<loc>(.*?)<\/loc>/g);
    
    if (!urlMatches) {
      console.log('No URLs found in XML sitemap');
      return movies;
    }

    console.log(`Found ${urlMatches.length} URLs in sitemap`);

    for (const urlMatch of urlMatches) {
      const url = urlMatch.replace(/<\/?loc>/g, '').trim();
      
      // Check if URL looks like a movie page
      if (isMovieUrl(url)) {
        const title = extractTitleFromUrl(url);
        if (title) {
          movies.push({ title, url });
        }
      }
    }

    console.log(`Extracted ${movies.length} movie URLs from sitemap`);
    return movies;
  } catch (error) {
    console.error('Error parsing XML sitemap:', error);
    return movies;
  }
}

/**
 * Parses HTML content to extract movie links
 */
function parseHtmlForMovieLinks(htmlContent: string): ParsedSitemapMovie[] {
  const movies: ParsedSitemapMovie[] = [];
  
  try {
    // Extract all href attributes
    const linkMatches = htmlContent.match(/href=["'](.*?)["']/g);
    
    if (!linkMatches) {
      console.log('No links found in HTML content');
      return movies;
    }

    console.log(`Found ${linkMatches.length} links in HTML`);

    for (const linkMatch of linkMatches) {
      const url = linkMatch.replace(/href=["']|["']/g, '').trim();
      
      // Check if URL looks like a movie page
      if (isMovieUrl(url)) {
        const title = extractTitleFromUrl(url);
        if (title) {
          movies.push({ title, url });
        }
      }
    }

    console.log(`Extracted ${movies.length} movie URLs from HTML`);
    return movies;
  } catch (error) {
    console.error('Error parsing HTML for movie links:', error);
    return movies;
  }
}

/**
 * Checks if a URL looks like a movie page
 */
function isMovieUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Convert to lowercase for case-insensitive matching
  const lowerUrl = url.toLowerCase();
  
  // Skip common non-movie URLs
  const skipPatterns = [
    '/category/', '/tag/', '/author/', '/page/', '/search/',
    '/contact', '/about', '/privacy', '/terms', '/sitemap',
    '.xml', '.rss', '.feed', '/feed/', '/wp-', '/admin/',
    '/login', '/register', '/cart', '/checkout', '/account',
    '.jpg', '.png', '.gif', '.css', '.js', '.ico'
  ];
  
  if (skipPatterns.some(pattern => lowerUrl.includes(pattern))) {
    return false;
  }
  
  // Look for movie-related patterns
  const moviePatterns = [
    '/movie/', '/film/', '/watch/', '/download/', '/stream/',
    'hindi', 'english', 'bollywood', 'hollywood', 'dubbed',
    '720p', '1080p', '480p', '4k', 'hdrip', 'webrip', 'bluray',
    'mkv', 'mp4', 'avi'
  ];
  
  // Check if URL contains movie-related keywords
  const hasMoviePattern = moviePatterns.some(pattern => lowerUrl.includes(pattern));
  
  // Check if URL has a reasonable structure (not just domain)
  const hasPath = url.includes('/') && url.split('/').length > 3;
  
  // Check if URL contains year patterns (movies often have years)
  const hasYear = /\b(19|20)\d{2}\b/.test(url);
  
  return hasMoviePattern || (hasPath && hasYear);
}

/**
 * Extracts movie title from URL
 */
function extractTitleFromUrl(url: string): string {
  try {
    // Get the last part of the URL path
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
    
    if (pathParts.length === 0) return '';
    
    // Get the last meaningful part
    let title = pathParts[pathParts.length - 1];
    
    // Remove file extensions
    title = title.replace(/\.(html?|php|asp|jsp)$/i, '');
    
    // Replace hyphens and underscores with spaces
    title = title.replace(/[-_]/g, ' ');
    
    // Remove common movie quality indicators
    title = title.replace(/\b(720p|1080p|480p|4k|hdrip|webrip|bluray|dvdrip|camrip|hdcam)\b/gi, '');
    
    // Remove year patterns at the end
    title = title.replace(/\s*\b(19|20)\d{2}\b\s*$/, '');
    
    // Clean up extra spaces
    title = title.replace(/\s+/g, ' ').trim();
    
    // Capitalize first letter of each word
    title = title.replace(/\b\w/g, char => char.toUpperCase());
    
    return title || 'Unknown Movie';
  } catch (error) {
    console.error('Error extracting title from URL:', error);
    return 'Unknown Movie';
  }
}

/**
 * Converts parsed movies to database format
 */
export function convertToExtractedMovies(parsedMovies: ParsedSitemapMovie[], sitemapId: number, siteName: string): CreateExtractedMovieData[] {
  return parsedMovies.map(movie => ({
    sitemap_id: sitemapId,
    title: movie.title,
    url: movie.url,
    site_name: siteName,
    status: 'active'
  }));
}