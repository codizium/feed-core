/**
 * FeedJS Core - Layout Resolution
 *
 * Resolves compile-time layout inheritance.
 * This module processes:
 * - <layout> and <feed-layout> elements for page-level layouts
 * - f:inherit attribute for element-level inheritance
 */
import type { FeedAST } from '../ast/nodes.js';
/**
 * Detect if the AST uses a layout and resolve it
 *
 * @param ast - The page AST
 * @param resolveLayoutFile - Function to resolve layout file path to content
 * @returns Processed AST with layout merged
 */
export declare function resolveLayout(ast: FeedAST, resolveLayoutFile: (src: string) => string): FeedAST;
/**
 * Compile error class
 */
export declare class CompileError extends Error {
    source: string;
    constructor(message: string, source: string);
}
//# sourceMappingURL=resolveLayout.d.ts.map