/**
 * FeedJS Core - VDOM Node Types
 *
 * Defines the Virtual DOM (VDOM) node structure.
 * VDOM is platform-agnostic and represents the renderable tree.
 */
import type { IRNode } from '../ir/transform.js';
export declare const FragmentSymbol: unique symbol;
export declare const TextSymbol: unique symbol;
export interface VNode {
    type: string | symbol;
    props: VNodeProps | null;
    children: VNodeChild;
    key: string;
    interpolation?: string;
    directives?: Array<{
        type: string;
        name: string;
        value: string;
        expression: string;
        modifiers?: string[];
    }>;
}
export interface VNodeProps {
    [key: string]: VNodePropValue;
}
export type VNodePropValue = string | number | boolean | null | undefined;
export type VNodeChild = VNode[] | string | null;
export interface VNodeState {
    [key: string]: unknown;
}
/**
 * Create a VDOM node from IR
 *
 * @param ir - The IR node(s) to convert
 * @param state - The current state for evaluating expressions
 * @returns VNode
 */
export declare function createVDOM(ir: IRNode | IRNode[], state: VNodeState): VNode;
/**
 * Check if VNode is a text node
 */
export declare function isTextVNode(node: VNode): boolean;
/**
 * Check if VNode is a fragment
 */
export declare function isFragment(node: VNode): boolean;
/**
 * Get the type name of a VNode
 */
export declare function getVNodeType(node: VNode): string;
//# sourceMappingURL=vnode.d.ts.map