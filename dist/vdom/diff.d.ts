/**
 * FeedJS Core - VDOM Diff Algorithm
 *
 * Deterministic, keyed diff algorithm for VDOM trees.
 * Outputs patch operations for minimal DOM updates.
 */
import type { VNode } from './vnode.js';
export type PatchType = 'CREATE' | 'REMOVE' | 'REPLACE' | 'UPDATE_PROPS' | 'MOVE';
export interface Patch {
    type: PatchType;
    node?: VNode;
    index?: number;
    from?: number;
    to?: number;
    props?: Record<string, unknown>;
}
export type PatchList = Patch[];
/**
 * Diff two VDOM trees and produce patch operations
 *
 * @param oldTree - The previous VDOM tree
 * @param newTree - The new VDOM tree
 * @returns Array of patch operations
 */
export declare function diff(oldTree: VNode | null, newTree: VNode | null): PatchList;
/**
 * Apply patches to a VNode tree (for testing)
 *
 * Note: This is a simplified implementation. In production,
 * the runtime would apply these patches to the actual DOM.
 */
export declare function applyPatches(tree: VNode, patches: PatchList): VNode;
//# sourceMappingURL=diff.d.ts.map