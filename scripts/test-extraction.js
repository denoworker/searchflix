require('dotenv').config({ path: '.env.local' });
const axios = require('axios');
const cheerio = require('cheerio');

async function testExtraction() {
  try {
    const testUrl = 'https://hdhub4u.florist/saiyaara-2025-hindi-webrip-full-movie/';
    console.log(`Testing extraction from: ${testUrl}`);
    
    const response = await axios.get(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    
    console.log('\n=== EXTRACTION RESULTS ===');
    
    // Test title extraction
    const title = (
      $('.post-title').text().trim() ||
      $('.entry-title').text().trim() ||
      $('h1').first().text().trim() ||
      $('title').text().replace(' - HDHub4u', '').trim() ||
      ''
    );
    console.log(`Title: ${title}`);
    
    // Test genre extraction
    const genreText = $('*').filter(function() {
      return $(this).text().includes('Genre:');
    }).text();
    
    let genre = 'Unknown';
    if (genreText) {
      const match = genreText.match(/Genre:\s*([^\n\r]+)/);
      if (match) {
        genre = match[1].trim();
      }
    }
    console.log(`Genre: ${genre}`);
    console.log(`Genre text found: ${genreText.substring(0, 200)}...`);
    
    // Test rating extraction
    const ratingText = $('*').filter(function() {
      return $(this).text().includes('iMDB Rating:') || $(this).text().includes('Rating:');
    }).text();
    
    let rating = '';
    if (ratingText) {
      const match = ratingText.match(/(?:iMDB\s+)?Rating:\s*([0-9.]+(?:\/10)?)/i);
      if (match) {
        rating = match[1].trim();
      }
    }
    console.log(`Rating: ${rating}`);
    console.log(`Rating text found: ${ratingText.substring(0, 200)}...`);
    
    // Test director extraction
    const directorText = $('*').filter(function() {
      return $(this).text().includes('Director:');
    }).text();
    
    let director = '';
    if (directorText) {
      const match = directorText.match(/Director:\s*([^\n\r]+)/);
      if (match) {
        director = match[1].trim();
      }
    }
    console.log(`Director: ${director}`);
    console.log(`Director text found: ${directorText.substring(0, 200)}...`);
    
    // Test cast extraction
    const castText = $('*').filter(function() {
      return $(this).text().includes('Stars:');
    }).text();
    
    let cast = '';
    if (castText) {
      const match = castText.match(/Stars:\s*([^\n\r]+)/);
      if (match) {
        cast = match[1].trim();
      }
    }
    console.log(`Cast: ${cast}`);
    console.log(`Cast text found: ${castText.substring(0, 200)}...`);
    
    // Show some of the HTML content for debugging
    console.log('\n=== HTML SAMPLE ===');
    console.log($('body').text().substring(0, 1000) + '...');
    
  } catch (error) {
    console.error('Error testing extraction:', error.message);
  }
}

testExtraction();