/**
 * FeedJS Core - HTML Parser
 *
 * Parses HTML templates into Feed AST nodes.
 * Handles standard HTML elements, text, comments, and Feed directives.
 * Supports {{ expression }} interpolation syntax.
 */
import type { FeedAST } from '../ast/nodes.js';
/**
 * Parse HTML template string into Feed AST
 */
export declare function parseTemplate(html: string): FeedAST;
//# sourceMappingURL=htmlParser.d.ts.map