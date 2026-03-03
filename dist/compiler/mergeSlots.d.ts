/**
 * FeedJS Core - Slot Merging
 *
 * Pure slot substitution logic.
 * This module handles the merging of slot content into layouts.
 */
import type { FeedASTNode } from '../ast/nodes.js';
/**
 * Slot content map
 */
export type SlotContentMap = Map<string, FeedASTNode[]>;
/**
 * Merge slot content into layout nodes
 *
 * @param layoutNodes - The layout AST nodes
 * @param slots - Map of slot name to content
 * @returns Merged AST nodes
 */
export declare function mergeSlots(layoutNodes: FeedASTNode[], slots: SlotContentMap): FeedASTNode[];
/**
 * Validate slot usage for errors
 */
export declare function validateSlots(layoutNodes: FeedASTNode[], providedSlots: SlotContentMap): void;
/**
 * Extract slots from a page AST
 *
 * @param nodes - AST nodes to extract from
 * @returns Map of slot name to content
 */
export declare function extractSlots(nodes: FeedASTNode[]): SlotContentMap;
//# sourceMappingURL=mergeSlots.d.ts.map