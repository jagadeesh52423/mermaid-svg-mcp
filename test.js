#!/usr/bin/env node

/**
 * Simple test script to verify the MCP server functionality
 * This simulates an MCP client calling the server
 */

import { createServer } from './dist/server.js';

async function testMcpServer() {
  console.log('🧪 Testing Mermaid SVG MCP Server...\n');

  try {
    // Create server instance
    const server = createServer();

    // Test 1: List tools
    console.log('📋 Test 1: Listing available tools...');
    const listResponse = await server._requestHandlers.get('notifications/tools/list')({
      method: 'notifications/tools/list',
      params: {}
    });

    console.log('✅ Tools available:', listResponse.tools.map(t => t.name));
    console.log('');

    // Test 2: Generate simple SVG
    console.log('🎨 Test 2: Generating simple flowchart SVG...');
    const simpleChart = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Success]
    B -->|No| D[Try Again]
    D --> A`;

    const svgResponse = await server._requestHandlers.get('tools/call')({
      method: 'tools/call',
      params: {
        name: 'generate_mermaid_svg',
        arguments: {
          mermaid: simpleChart,
          theme: 'default',
          backgroundColor: 'white'
        }
      }
    });

    if (svgResponse.content && svgResponse.content[0] && svgResponse.content[0].text) {
      const svgContent = svgResponse.content[0].text;
      if (svgContent.includes('<svg') && svgContent.includes('</svg>')) {
        console.log('✅ SVG generated successfully');
        console.log(`📏 SVG size: ${svgContent.length} characters`);

        // Save test SVG to file
        const fs = await import('fs');
        fs.writeFileSync('test-output.svg', svgContent);
        console.log('💾 Test SVG saved to test-output.svg');
      } else {
        console.log('❌ Generated content is not valid SVG');
        console.log('Content preview:', svgContent.substring(0, 200) + '...');
      }
    } else {
      console.log('❌ No SVG content in response');
      console.log('Response:', JSON.stringify(svgResponse, null, 2));
    }

    console.log('');

    // Test 3: Generate with dark theme
    console.log('🌙 Test 3: Generating with dark theme...');
    const darkResponse = await server._requestHandlers.get('tools/call')({
      method: 'tools/call',
      params: {
        name: 'generate_mermaid_svg',
        arguments: {
          mermaid: simpleChart,
          theme: 'dark',
          backgroundColor: '#2d3748'
        }
      }
    });

    if (darkResponse.content && darkResponse.content[0] && darkResponse.content[0].text) {
      console.log('✅ Dark theme SVG generated successfully');

      // Save dark theme SVG to file
      const fs = await import('fs');
      fs.writeFileSync('test-dark-output.svg', darkResponse.content[0].text);
      console.log('💾 Dark theme SVG saved to test-dark-output.svg');
    } else {
      console.log('❌ Dark theme SVG generation failed');
    }

    console.log('');
    console.log('🎉 All tests completed!');

    // Clean up
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testMcpServer();