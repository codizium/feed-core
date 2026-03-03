/**
 * FeedJS Core - IR Transformer
 *
 * Transforms the Feed AST into an Intermediate Representation (IR).
 * IR is a normalized, explicit representation without raw strings or HTML parsing logic.
 */
import type { FeedAST } from '../ast/nodes.js';
export type IRNodeKind = 'element' | 'text' | 'fragment';
export interface IRProps {
    [key: string]: IRPropValue;
}
export type IRPropValue = string | number | boolean | undefined;
export interface IRNode {
    kind: IRNodeKind;
    tag?: string;
    props?: IRProps;
    children?: IRNode[];
    key?: string;
    directives?: IRDirective[];
    value?: string;
}
export interface IRDirective {
    type: string;
    name: string;
    value: string;
    expression: string;
    modifiers: string[];
}
export interface IRForLoop {
    item: string;
    index: string;
    collection: string;
    body: IRNode[];
}
export interface IRConditionalBranch {
    condition: string | null;
    nodes: IRNode[];
}
/**
 * Transform Feed AST to IR
 */
export declare function transformAST(ast: FeedAST): IRNode[];
/**
 * Check if an IR node has conditional directives
 */
export declare function hasConditionals(node: IRNode): boolean;
/**
 * Check if an IR node has a for loop
 */
export declare function hasForLoop(node: IRNode): boolean;
/**
 * Get key from IR node
 */
export declare function getKey(node: IRNode): string | number | undefined;
//# sourceMappingURL=transform.d.ts.map