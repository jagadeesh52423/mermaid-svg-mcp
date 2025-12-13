#!/usr/bin/env node

/**
 * Simple test of the JSDOM Mermaid renderer
 */

import { jsdomRenderer } from './dist/jsdom-renderer.js';

async function testJSDOMRenderer() {
  console.log('🧪 Testing JSDOM Mermaid Renderer...\n');

  try {
    const simpleChart = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Success]
    B -->|No| D[Try Again]
    D --> A`;

    console.log('🎨 Rendering simple flowchart...');

    const result = await jsdomRenderer.renderToSvg(simpleChart, {
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
      fs.writeFileSync('test-jsdom-output.svg', result.svg);
      console.log('💾 Test SVG saved to test-jsdom-output.svg');

      // Test dark theme
      console.log('\n🌙 Testing dark theme...');
      const darkResult = await jsdomRenderer.renderToSvg(simpleChart, {
        theme: 'dark',
        backgroundColor: '#2d3748'
      });

      if (darkResult.error) {
        console.log('❌ Dark theme rendering failed:', darkResult.error);
      } else {
        console.log('✅ Dark theme SVG generated successfully');
        fs.writeFileSync('test-dark-jsdom-output.svg', darkResult.svg);
        console.log('💾 Dark theme SVG saved to test-dark-jsdom-output.svg');
      }

      // Test sequence diagram
      console.log('\n📊 Testing sequence diagram...');
      const sequenceChart = `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob, how are you?
    B-->>A: Great!`;

      const sequenceResult = await jsdomRenderer.renderToSvg(sequenceChart, {
        theme: 'default',
        backgroundColor: 'white'
      });

      if (sequenceResult.error) {
        console.log('❌ Sequence diagram rendering failed:', sequenceResult.error);
      } else {
        console.log('✅ Sequence diagram SVG generated successfully');
        fs.writeFileSync('test-sequence-output.svg', sequenceResult.svg);
        console.log('💾 Sequence diagram SVG saved to test-sequence-output.svg');
      }

    } else {
      console.log('❌ Generated content is not valid SVG');
      console.log('Content preview:', result.svg.substring(0, 200) + '...');
    }

    console.log('\n🎉 JSDOM renderer test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    // Clean up
    await jsdomRenderer.close();
    process.exit(0);
  }
}

// Run the test
testJSDOMRenderer();