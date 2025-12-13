# Usage Guide

## Quick Start

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Configure Claude Desktop:**
   Add this to your Claude Desktop MCP configuration:
   ```json
   {
     "mcpServers": {
       "mermaid-svg": {
         "command": "node",
         "args": ["/Users/jagadeeshpulamarasetti/OwnCode/mermaid-svg-mcp/dist/index.js"],
         "env": {}
       }
     }
   }
   ```

3. **Use in Claude:**
   ```
   Please generate an SVG from this Mermaid diagram:

   graph TD
       A[Start] --> B{Decision}
       B -->|Yes| C[Success]
       B -->|No| D[Try Again]
       D --> A
   ```

## Tool Parameters

### `generate_mermaid_svg`

**Required:**
- `mermaid` (string): The Mermaid diagram syntax

**Optional:**
- `theme` (string): One of `default`, `base`, `forest`, `dark`, `neutral`
- `backgroundColor` (string): CSS color value (e.g., "white", "#f0f0f0", "rgba(255,255,255,0.8)")

## Examples

### Basic Flowchart
```json
{
  "mermaid": "graph TD\\n    A[Start] --> B[Process]\\n    B --> C[End]",
  "theme": "default",
  "backgroundColor": "white"
}
```

### Sequence Diagram with Dark Theme
```json
{
  "mermaid": "sequenceDiagram\\n    participant A as Alice\\n    participant B as Bob\\n    A->>B: Hello Bob!\\n    B-->>A: Hi Alice!",
  "theme": "dark",
  "backgroundColor": "#2d3748"
}
```

### Class Diagram
```json
{
  "mermaid": "classDiagram\\n    class Animal {\\n        +String name\\n        +eat()\\n    }\\n    class Dog {\\n        +bark()\\n    }\\n    Animal <|-- Dog",
  "theme": "forest"
}
```

## Supported Diagram Types

- **Flowcharts** (`graph` or `flowchart`)
- **Sequence Diagrams** (`sequenceDiagram`)
- **Class Diagrams** (`classDiagram`)
- **State Diagrams** (`stateDiagram`)
- **ER Diagrams** (`erDiagram`)
- **User Journey** (`journey`)
- **Gantt Charts** (`gantt`)
- **Pie Charts** (`pie`)
- **Requirement Diagrams** (`requirementDiagram`)
- **C4 Diagrams** (`C4Context`, `C4Container`, etc.)

## Output

The tool returns the complete SVG content as text, which can be:
- Saved to a `.svg` file
- Embedded in HTML
- Used in documentation
- Converted to other formats

## Troubleshooting

### Common Issues

1. **Server not starting:** Ensure Node.js is installed and the path in the config is correct
2. **Mermaid syntax errors:** Validate your diagram syntax at https://mermaid.live
3. **Theme not applied:** Check that the theme name is spelled correctly and is one of the supported values

### Debugging

Check the logs in your MCP client for detailed error messages. Common issues:
- Invalid Mermaid syntax
- Unsupported diagram features
- Missing dependencies

## Comparison with Original MCP

This simplified version:

**✅ Provides:**
- Clean SVG-only output
- All Mermaid diagram types
- Theme support
- Background colors
- Simple parameter interface

**❌ Removes:**
- Multiple output formats (PNG, base64, URLs)
- File system operations
- Complex configuration
- Image screenshot capabilities

Perfect for: Documentation, web integration, programmatic SVG generation