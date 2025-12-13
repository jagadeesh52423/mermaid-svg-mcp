# Mermaid SVG MCP Server

A simplified Model Context Protocol (MCP) server that generates SVG files from Mermaid diagram syntax. This is a streamlined version focused solely on SVG generation, without the complexity of multiple export formats.

## Features

- **Single Focus**: Only generates SVG output - no base64, PNG, or file outputs
- **Theme Support**: Supports 5 built-in Mermaid themes (default, base, forest, dark, neutral)
- **Background Colors**: Customizable background colors for diagrams
- **Clean API**: Simple, focused tool interface
- **Puppeteer-Based**: Uses headless browser for reliable rendering

## Installation

### From npm (Recommended)

```bash
npm install -g mermaid-svg-mcp
```

### From source

```bash
git clone <repository-url>
cd mermaid-svg-mcp
npm install
npm run build
```

## Usage

### As MCP Server

Add to your MCP client configuration (typically in `mcp.json` or Claude Desktop config):

#### Using npx (recommended - no global install needed):

```json
{
  "mcpServers": {
    "mermaid-svg": {
      "command": "npx",
      "args": ["-y", "mermaid-svg-mcp"]
    }
  }
}
```

#### Using global install:

```json
{
  "mcpServers": {
    "mermaid-svg": {
      "command": "mermaid-svg-mcp"
    }
  }
}
```

#### Using local development version:

```json
{
  "mcpServers": {
    "mermaid-svg": {
      "command": "node",
      "args": ["/path/to/mermaid-svg-mcp/dist/index.js"]
    }
  }
}
```

### Tool Interface

The server provides a single tool: `generate_mermaid_svg`

**Parameters:**
- `mermaid` (required): The Mermaid diagram syntax
- `theme` (optional): Theme name - one of: default, base, forest, dark, neutral
- `backgroundColor` (optional): CSS color value for background (default: "white")

**Example:**
```javascript
{
  "mermaid": "graph TD\\n    A[Start] --> B{Decision}\\n    B -->|Yes| C[Success]\\n    B -->|No| D[Try Again]\\n    D --> A",
  "theme": "dark",
  "backgroundColor": "#f0f0f0"
}
```

**Returns:**
- SVG content as text

## Supported Diagram Types

All standard Mermaid diagram types are supported:
- Flowcharts
- Sequence diagrams
- Class diagrams
- State diagrams
- ER diagrams
- User journey
- Gantt charts
- Pie charts
- And more...

## Development

```bash
npm run dev    # Run in development mode
npm run build  # Build for production
npm start      # Run built version
```

## Comparison with Original MCP

This simplified version removes:
- Multiple output formats (base64, file, URL generation)
- File system operations
- Complex configuration options
- PNG rendering options

And focuses on:
- Clean SVG-only output
- Simple parameter interface
- Reliable rendering
- Minimal dependencies

## License

MIT