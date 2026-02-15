import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  type MermaidRenderer,
  type RenderResult,
  createMermaidRenderer,
} from "mermaid-isomorphic";

export interface RenderOptions {
  theme?: 'default' | 'base' | 'forest' | 'dark' | 'neutral';
  backgroundColor?: string;
  customCSS?: string;
  svgDefs?: string;
}

export interface SimplifiedRenderResult {
  svg: string;
  error?: string;
}

export class IsomorphicMermaidRenderer {
  private renderer: MermaidRenderer | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized && this.renderer) return;

    try {
      this.renderer = createMermaidRenderer();
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize Mermaid renderer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async renderToSvg(diagramCode: string, options: RenderOptions = {}): Promise<SimplifiedRenderResult> {
    await this.initialize();

    if (!this.renderer) {
      return { svg: '', error: 'Renderer not initialized' };
    }

    try {
      const { theme = 'default', backgroundColor = 'white', customCSS = '', svgDefs = '' } = options;

      // Create temporary CSS file for background color
      const cssContent = `svg { background: ${backgroundColor}; }`;
      const cssTmpPath = path.join(os.tmpdir(), `mermaid-tmp-css-${Date.now()}.css`);
      fs.writeFileSync(cssTmpPath, cssContent);

      // Pre-process the code similar to your ReactToolBox implementation
      let processedCode = diagramCode.trim();
      processedCode = processedCode.replace(/(\w+)\s+--\s+([^-]+)\s+-->\s+(\w+)/g, '$1 -->|$2| $3');

      // Render with mermaid-isomorphic
      const results = await this.renderer([processedCode], {
        // We only need SVG, not screenshot
        screenshot: false,
        css: cssTmpPath,
        mermaidConfig: {
          theme: theme as any,
          startOnLoad: false,
          securityLevel: 'loose',
          er: { useMaxWidth: false },
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: 'basis',
            rankSpacing: 80,
            nodeSpacing: 50,
            diagramPadding: 8,
          },
          sequence: { useMaxWidth: false },
          gantt: { useMaxWidth: false },
          logLevel: 'fatal',
        },
      });

      // Clean up temporary CSS file
      try {
        fs.unlinkSync(cssTmpPath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary CSS file:', cleanupError);
      }

      const result = results[0] as PromiseSettledResult<RenderResult>;

      if (result.status === 'fulfilled') {
        const renderResult = result.value;

        // Extract SVG content
        let svgContent = renderResult.svg || '';

        // If background color is specified and not white, ensure it's applied
        if (backgroundColor && backgroundColor !== '#ffffff' && backgroundColor !== 'white') {
          svgContent = this.addBackgroundToSvg(svgContent, backgroundColor);
        }

        // Inject custom CSS into the SVG's <style> block so it persists in the output
        if (customCSS) {
          svgContent = this.injectCustomCSS(svgContent, customCSS);
        }

        // Inject custom SVG <defs> (gradients, patterns, filters, etc.)
        if (svgDefs) {
          svgContent = this.injectSvgDefs(svgContent, svgDefs);
        }

        return { svg: svgContent };
      } else {
        const error = result.reason;
        return {
          svg: '',
          error: `Failed to render mermaid diagram: ${error instanceof Error ? error.message : String(error)}`
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        svg: '',
        error: `Failed to render mermaid diagram: ${errorMessage}`
      };
    }
  }

  private injectSvgDefs(svgContent: string, svgDefs: string): string {
    try {
      // If there's an existing <defs> block, append inside it
      const defsCloseIndex = svgContent.lastIndexOf('</defs>');
      if (defsCloseIndex !== -1) {
        return svgContent.slice(0, defsCloseIndex) +
          `\n<!-- Custom SVG Defs -->\n${svgDefs}\n` +
          svgContent.slice(defsCloseIndex);
      }

      // No <defs> block — create one right after the opening <svg> tag
      const svgMatch = svgContent.match(/<svg[^>]*>/);
      if (svgMatch) {
        const insertPos = svgMatch.index! + svgMatch[0].length;
        return svgContent.slice(0, insertPos) +
          `\n<defs>\n<!-- Custom SVG Defs -->\n${svgDefs}\n</defs>` +
          svgContent.slice(insertPos);
      }

      return svgContent;
    } catch (error) {
      console.error('Error injecting SVG defs:', error);
      return svgContent;
    }
  }

  private injectCustomCSS(svgContent: string, customCSS: string): string {
    try {
      // Find the last </style> tag in the SVG and inject custom CSS before it.
      // This ensures custom rules come after Mermaid's own styles, giving them higher precedence.
      const lastStyleCloseIndex = svgContent.lastIndexOf('</style>');
      if (lastStyleCloseIndex !== -1) {
        return svgContent.slice(0, lastStyleCloseIndex) +
          `\n/* Custom CSS */\n${customCSS}\n` +
          svgContent.slice(lastStyleCloseIndex);
      }

      // No <style> tag found — create one right after the opening <svg> tag
      const svgMatch = svgContent.match(/<svg[^>]*>/);
      if (svgMatch) {
        const insertPos = svgMatch.index! + svgMatch[0].length;
        return svgContent.slice(0, insertPos) +
          `<style>\n/* Custom CSS */\n${customCSS}\n</style>` +
          svgContent.slice(insertPos);
      }

      return svgContent;
    } catch (error) {
      console.error('Error injecting custom CSS into SVG:', error);
      return svgContent;
    }
  }

  private addBackgroundToSvg(svgContent: string, backgroundColor: string): string {
    try {
      // Parse the SVG to add background rectangle if needed
      const svgMatch = svgContent.match(/<svg[^>]*>/);
      if (!svgMatch) return svgContent;

      const svgTag = svgMatch[0];
      const afterSvgTag = svgContent.substring(svgMatch.index! + svgTag.length);

      // Extract width and height from SVG tag
      const widthMatch = svgTag.match(/width="([^"]*)"/);
      const heightMatch = svgTag.match(/height="([^"]*)"/);

      const width = widthMatch ? widthMatch[1] : '100%';
      const height = heightMatch ? heightMatch[1] : '100%';

      // Create background rectangle
      const backgroundRect = `<rect width="${width}" height="${height}" fill="${backgroundColor}"/>`;

      // Insert background rectangle right after opening SVG tag
      return svgTag + backgroundRect + afterSvgTag;
    } catch (error) {
      console.error('Error adding background to SVG:', error);
      return svgContent; // Return original if processing fails
    }
  }

  async close(): Promise<void> {
    // mermaid-isomorphic handles cleanup automatically
    this.isInitialized = false;
    this.renderer = null;
  }
}

// Create a singleton instance
export const isomorphicRenderer = new IsomorphicMermaidRenderer();

// Cleanup on process exit
process.on('exit', () => {
  isomorphicRenderer.close();
});

process.on('SIGINT', () => {
  isomorphicRenderer.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  isomorphicRenderer.close();
  process.exit(0);
});