
import { getAllSitemaps, deleteSitemap } from '../src/lib/database';

async function removeSitemap() {
  try {
    const targetUrl = 'https://hdhub4u.florist/post-sitemap.xml';
    
    console.log('🔍 Searching for sitemap with URL:', targetUrl);
    
    // Get all sitemaps
    const sitemaps = await getAllSitemaps();
    
    // Find the target sitemap
    const targetSitemap = sitemaps.find(sitemap => sitemap.url === targetUrl);
    
    if (!targetSitemap) {
      console.log('❌ Sitemap not found with URL:', targetUrl);
      console.log('📋 Available sitemaps:');
      sitemaps.forEach(sitemap => {
        console.log(`   - ID: ${sitemap.id}, URL: ${sitemap.url}`);
      });
      return;
    }
    
    console.log('✅ Found sitemap:');
    console.log(`   ID: ${targetSitemap.id}`);
    console.log(`   Site Name: ${targetSitemap.site_name}`);
    console.log(`   URL: ${targetSitemap.url}`);
    console.log(`   Status: ${targetSitemap.status}`);
    console.log(`   Created: ${targetSitemap.created_at}`);
    
    // Delete the sitemap
    console.log('🗑️  Deleting sitemap...');
    const deleted = await deleteSitemap(targetSitemap.id);
    
    if (deleted) {
      console.log('✅ Successfully deleted sitemap!');
      console.log('   All related extracted movies and raw movies have been automatically deleted due to CASCADE constraints.');
    } else {
      console.log('❌ Failed to delete sitemap');
    }
    
  } catch (error) {
    console.error('❌ Error removing sitemap:', error);
  }
}

removeSitemap();
