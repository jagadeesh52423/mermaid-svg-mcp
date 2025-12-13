#!/usr/bin/env node

/**
 * Simple direct test of the Mermaid renderer
 */

import { mermaidRenderer } from './dist/mermaid-renderer.js';

async function testRenderer() {
  console.log('🧪 Testing Mermaid Renderer directly...\n');

  try {
    const simpleChart = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Success]
    B -->|No| D[Try Again]
    D --> A`;

    console.log('🎨 Rendering simple flowchart...');

    const result = await mermaidRenderer.renderToSvg(simpleChart, {
      theme: 'default',
      backgroundColor: 'white'
    });

    if (result.error) {
      console.log('❌ Rendering failed:', result.error);
    } else if (result.svg.includes('<svg') && result.svg.includes('</svg>')) {
      console.log('✅ SVG generated successfully');
      console.log(`📏 SVG size: ${result.svg.length} characters`);

      // Save test SVG to file
      const fs = await import('fs');
      fs.writeFileSync('test-direct-output.svg', result.svg);
      console.log('💾 Test SVG saved to test-direct-output.svg');

      // Test dark theme
      console.log('\n🌙 Testing dark theme...');
      const darkResult = await mermaidRenderer.renderToSvg(simpleChart, {
        theme: 'dark',
        backgroundColor: '#2d3748'
      });

      if (darkResult.error) {
        console.log('❌ Dark theme rendering failed:', darkResult.error);
      } else {
        console.log('✅ Dark theme SVG generated successfully');
        fs.writeFileSync('test-dark-direct-output.svg', darkResult.svg);
        console.log('💾 Dark theme SVG saved to test-dark-direct-output.svg');
      }

    } else {
      console.log('❌ Generated content is not valid SVG');
      console.log('Content preview:', result.svg.substring(0, 200) + '...');
    }

    console.log('\n🎉 Direct renderer test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    // Clean up
    await mermaidRenderer.close();
    process.exit(0);
  }
}

// Run the test
testRenderer();