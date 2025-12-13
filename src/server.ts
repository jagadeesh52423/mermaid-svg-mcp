import * as fs from "node:fs";
import * as path from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { isomorphicRenderer } from "./isomorphic-renderer.js";

// Input schema for the mermaid SVG generation tool
const MermaidSvgSchema = z.object({
  mermaid: z
    .string()
    .describe("The mermaid diagram syntax to be rendered as SVG")
    .min(1, "Mermaid diagram code cannot be empty"),
  theme: z
    .enum(["default", "base", "forest", "dark", "neutral"])
    .describe("Theme for the diagram")
    .optional()
    .default("default"),
  backgroundColor: z
    .string()
    .describe("Background color for the diagram (CSS color value)")
    .optional()
    .default("white"),
});

type MermaidSvgInput = z.infer<typeof MermaidSvgSchema>;

// Convert Zod schema to JSON schema for MCP
function createInputSchema() {
  return {
    type: "object",
    properties: {
      mermaid: {
        type: "string",
        description: "The mermaid diagram syntax to be rendered as SVG"
      },
      theme: {
        type: "string",
        enum: ["default", "base", "forest", "dark", "neutral"],
        description: "Theme for the diagram",
        default: "default"
      },
      backgroundColor: {
        type: "string",
        description: "Background color for the diagram (CSS color value)",
        default: "white"
      }
    },
    required: ["mermaid"]
  };
}

export function createServer(): Server {
  const server = new Server(
    {
      name: "mermaid-svg-mcp",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "generate_mermaid_svg",
          description: "Generate SVG content from Mermaid diagram syntax and save it to a file. This tool renders Mermaid diagrams to SVG format with customizable themes and background colors, always saving the result as an SVG file.",
          inputSchema: createInputSchema(),
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "generate_mermaid_svg") {
      try {
        const result = MermaidSvgSchema.safeParse(request.params.arguments || {});

        if (!result.success) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid parameters: ${result.error.message}`
          );
        }

        const { mermaid: diagramCode, theme, backgroundColor } = result.data;

        // Render the mermaid diagram to SVG
        const renderResult = await isomorphicRenderer.renderToSvg(diagramCode, {
          theme,
          backgroundColor,
        });

        if (renderResult.error) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to render mermaid diagram: ${renderResult.error}`
          );
        }

        // Always save to file
        // Create a unique filename with timestamp and random suffix
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const filename = `mermaid-${timestamp}-${randomSuffix}.svg`;

        // Use current working directory to save the file
        const filePath = path.resolve(process.cwd(), filename);

        try {
          fs.writeFileSync(filePath, renderResult.svg, "utf8");

          return {
            content: [
              {
                type: "text",
                text: `Mermaid SVG diagram saved to file: ${filePath}`,
              },
            ],
          };
        } catch (fileError) {
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to save file: ${fileError instanceof Error ? fileError.message : "Unknown file error"}`,
          );
        }
      } catch (error) {
        if (error instanceof McpError) throw error;

        throw new McpError(
          ErrorCode.InternalError,
          `Failed to generate mermaid SVG: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    } else {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${request.params.name}`
      );
    }
  });

  // Error handler
  server.onerror = (error) => {
    console.error("MCP Server Error:", error);
  };

  return server;
}