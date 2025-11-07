#!/usr/bin/env node

/**
 * Test script to verify Ghost CMS API connectivity
 * Run with: node test-ghost-api.js
 */

const GhostContentAPI = require('@tryghost/content-api');

const api = new GhostContentAPI({
  url: process.env.GHOST_API_URL || 'https://blog.thehudsonfam.com',
  key: process.env.GHOST_CONTENT_API_KEY || 'your_api_key_here',
  version: 'v5.0'
});

async function testGhostAPI() {
  console.log('Testing Ghost CMS API connectivity...\n');
  console.log('Ghost URL:', process.env.GHOST_API_URL || 'https://blog.thehudsonfam.com');
  console.log('API Key:', process.env.GHOST_CONTENT_API_KEY ? '***configured***' : '❌ NOT SET');
  console.log('\n' + '='.repeat(50) + '\n');

  try {
    // Test 1: Fetch posts
    console.log('Test 1: Fetching posts...');
    const posts = await api.posts.browse({ limit: 5, include: ['tags', 'authors'] });
    console.log(`✅ Successfully fetched ${posts.length} posts`);

    if (posts.length > 0) {
      const post = posts[0];
      console.log('\nSample post:');
      console.log('  Title:', post.title);
      console.log('  Slug:', post.slug);
      console.log('  Excerpt:', post.excerpt?.substring(0, 100) + '...');
      console.log('  Published:', post.published_at);
      console.log('  Reading time:', post.reading_time, 'min');
      console.log('  Featured:', post.featured);

      if (post.tags && post.tags.length > 0) {
        console.log('  Tags:', post.tags.map(t => t.name).join(', '));
      }

      if (post.authors && post.authors.length > 0) {
        console.log('  Authors:', post.authors.map(a => a.name).join(', '));
      }
    }
    console.log();

    // Test 2: Fetch tags
    console.log('Test 2: Fetching tags...');
    const tags = await api.tags.browse({ limit: 10 });
    console.log(`✅ Successfully fetched ${tags.length} tags`);
    if (tags.length > 0) {
      console.log('  Tags:', tags.map(t => t.name).join(', '));
    }
    console.log();

    // Test 3: Fetch authors
    console.log('Test 3: Fetching authors...');
    const authors = await api.authors.browse({ limit: 10 });
    console.log(`✅ Successfully fetched ${authors.length} authors`);
    if (authors.length > 0) {
      console.log('  Authors:', authors.map(a => a.name).join(', '));
    }
    console.log();

    // Test 4: Fetch settings
    console.log('Test 4: Fetching settings...');
    const settings = await api.settings.browse();
    console.log('✅ Successfully fetched settings');
    console.log('  Title:', settings.title);
    console.log('  Description:', settings.description);
    console.log();

    // Test 5: Fetch featured posts
    console.log('Test 5: Fetching featured posts...');
    const featuredPosts = await api.posts.browse({ filter: 'featured:true', limit: 5 });
    console.log(`✅ Successfully fetched ${featuredPosts.length} featured posts`);
    console.log();

    console.log('='.repeat(50));
    console.log('✅ All tests passed successfully!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Error testing Ghost API:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }

    if (error.code) {
      console.error('Error code:', error.code);
    }

    console.log('\n' + '='.repeat(50));
    console.log('Troubleshooting:');
    console.log('1. Check if GHOST_CONTENT_API_KEY is set correctly');
    console.log('2. Verify Ghost CMS is accessible at:', process.env.GHOST_API_URL || 'https://blog.thehudsonfam.com');
    console.log('3. Make sure the API key is a Content API key (not Admin API key)');
    console.log('4. Check if Ghost CMS has published posts');
    console.log('='.repeat(50));

    process.exit(1);
  }
}

testGhostAPI();
