const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config({ path: '.env.local' });

async function testMovieExtraction() {
  try {
    const url = 'https://hdhub4u.florist/saiyaara-2025-hindi-movie-480p-720p-1080p-webrip/';
    console.log(`Testing extraction from: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Get the full text content to search for patterns
    const fullText = $('body').text();
    console.log('\n=== SEARCHING FOR PATTERNS ===');
    
    // Search for Genre pattern
    if (fullText.includes('Genre:')) {
      console.log('✓ Found "Genre:" in text');
      const genreMatch = fullText.match(/Genre:\s*([^\n\r]+)/);
      if (genreMatch) {
        console.log('Genre extracted:', genreMatch[1].trim());
      }
    } else {
      console.log('✗ "Genre:" not found in text');
    }
    
    // Search for Rating pattern
    if (fullText.includes('iMDB Rating:') || fullText.includes('Rating:')) {
      console.log('✓ Found rating pattern in text');
      const ratingMatch = fullText.match(/(?:iMDB\s+)?Rating:\s*([0-9.]+(?:\/10)?)/i);
      if (ratingMatch) {
        console.log('Rating extracted:', ratingMatch[1].trim());
      }
    } else {
      console.log('✗ Rating pattern not found in text');
    }
    
    // Search for Director pattern
    if (fullText.includes('Director:')) {
      console.log('✓ Found "Director:" in text');
      const directorMatch = fullText.match(/Director:\s*([^\n\r]+)/);
      if (directorMatch) {
        console.log('Director extracted:', directorMatch[1].trim());
      }
    } else {
      console.log('✗ "Director:" not found in text');
    }
    
    // Search for Stars pattern
    if (fullText.includes('Stars:')) {
      console.log('✓ Found "Stars:" in text');
      const starsMatch = fullText.match(/Stars:\s*([^\n\r]+)/);
      if (starsMatch) {
        console.log('Stars extracted:', starsMatch[1].trim());
      }
    } else {
      console.log('✗ "Stars:" not found in text');
    }
    
    // Search for Quality pattern
    if (fullText.includes('Quality:')) {
      console.log('✓ Found "Quality:" in text');
      const qualityMatch = fullText.match(/Quality:\s*([^\n\r]+)/);
      if (qualityMatch) {
        console.log('Quality extracted:', qualityMatch[1].trim());
      }
    } else {
      console.log('✗ "Quality:" not found in text');
    }
    
    // Search for Language pattern
    if (fullText.includes('Language:')) {
      console.log('✓ Found "Language:" in text');
      const languageMatch = fullText.match(/Language:\s*([^\n\r]+)/);
      if (languageMatch) {
        console.log('Language extracted:', languageMatch[1].trim());
      }
    } else {
      console.log('✗ "Language:" not found in text');
    }
    
    console.log('\n=== SAMPLE TEXT CONTENT ===');
    console.log(fullText.substring(0, 1000) + '...');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testMovieExtraction();