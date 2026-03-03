/**
 * FeedJS Core - Slot Merging
 *
 * Pure slot substitution logic.
 * This module handles the merging of slot content into layouts.
 */
/**
 * Merge slot content into layout nodes
 *
 * @param layoutNodes - The layout AST nodes
 * @param slots - Map of slot name to content
 * @returns Merged AST nodes
 */
export function mergeSlots(layoutNodes, slots) {
    const result = [];
    for (const node of layoutNodes) {
        if (node.type === 'Slot') {
            const slotNode = node;
            const slotName = slotNode.name || 'default';
            if (slots.has(slotName)) {
                // Use provided content
                result.push(...slots.get(slotName));
            }
            else if (slotNode.fallback && slotNode.fallback.length > 0) {
                // Use fallback content
                result.push(...slotNode.fallback);
            }
            else if (slotName !== 'default') {
                // Named slot with no content - error should be handled by caller
                continue;
            }
        }
        else if (node.type === 'Element' && node.children && node.children.length > 0) {
            // Recursively process children
            const processedChildren = mergeSlots(node.children, slots);
            result.push({
                ...node,
                children: processedChildren,
            });
        }
        else {
            result.push(node);
        }
    }
    return result;
}
/**
 * Validate slot usage for errors
 */
export function validateSlots(layoutNodes, providedSlots) {
    // Check for missing required slots
    for (const node of layoutNodes) {
        if (node.type === 'Slot') {
            const slotNode = node;
            const slotName = slotNode.name || 'default';
            if (!providedSlots.has(slotName) && !slotNode.fallback) {
                // This will be handled as an error by the caller
            }
        }
        if (node.type === 'Element' && node.children) {
            validateSlots(node.children, providedSlots);
        }
    }
}
/**
 * Extract slots from a page AST
 *
 * @param nodes - AST nodes to extract from
 * @returns Map of slot name to content
 */
export function extractSlots(nodes) {
    const slots = new Map();
    for (const node of nodes) {
        if (node.type === 'TemplateBlock') {
            const templateNode = node;
            slots.set(templateNode.name, templateNode.children);
        }
        if (node.type === 'SlotPlaceholder') {
            const slotNode = node;
            slots.set(slotNode.name, slotNode.children);
        }
    }
    return slots;
}
//# sourceMappingURL=mergeSlots.js.map