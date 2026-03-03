/**
 * FeedJS Core - VDOM Diff Algorithm
 *
 * Deterministic, keyed diff algorithm for VDOM trees.
 * Outputs patch operations for minimal DOM updates.
 */
/**
 * Diff two VDOM trees and produce patch operations
 *
 * @param oldTree - The previous VDOM tree
 * @param newTree - The new VDOM tree
 * @returns Array of patch operations
 */
export function diff(oldTree, newTree) {
    const patches = [];
    // Handle null cases
    if (oldTree === null && newTree === null) {
        return patches;
    }
    if (oldTree === null && newTree !== null) {
        patches.push({ type: 'CREATE', node: newTree });
        return patches;
    }
    if (oldTree !== null && newTree === null) {
        patches.push({ type: 'REMOVE', index: 0 });
        return patches;
    }
    // Both exist - diff them
    diffNodes(oldTree, newTree, patches, 0);
    return patches;
}
/**
 * Diff two VNodes
 */
function diffNodes(oldNode, newNode, patches, index) {
    // Check if nodes are the same type
    if (oldNode.type !== newNode.type) {
        // Different types - replace
        patches.push({ type: 'REPLACE', node: newNode });
        return;
    }
    // Same type - check if it's a text node
    if (typeof oldNode.type === 'symbol') {
        // Text or Fragment
        const oldText = getTextContent(oldNode);
        const newText = getTextContent(newNode);
        if (oldText !== newText) {
            patches.push({ type: 'REPLACE', node: newNode });
        }
        return;
    }
    // Element node - diff props
    if (oldNode.props || newNode.props) {
        const propPatches = diffProps(oldNode.props, newNode.props);
        if (propPatches && Object.keys(propPatches).length > 0) {
            patches.push({ type: 'UPDATE_PROPS', props: propPatches });
        }
    }
    // Diff children
    diffChildren(oldNode.children, newNode.children, patches, index);
}
/**
 * Get text content from a VNode
 */
function getTextContent(node) {
    if (typeof node.children === 'string') {
        return node.children;
    }
    return '';
}
/**
 * Diff props between two nodes
 */
function diffProps(oldProps, newProps) {
    const patches = {};
    const allKeys = new Set([
        ...Object.keys(oldProps ?? {}),
        ...Object.keys(newProps ?? {}),
    ]);
    for (const key of allKeys) {
        const oldValue = oldProps?.[key];
        const newValue = newProps?.[key];
        if (oldValue !== newValue) {
            patches[key] = newValue;
        }
    }
    return Object.keys(patches).length > 0 ? patches : null;
}
/**
 * Diff children arrays
 */
function diffChildren(oldChildren, newChildren, patches, parentIndex) {
    // Normalize to arrays
    const oldArray = normalizeChildren(oldChildren);
    const newArray = normalizeChildren(newChildren);
    // Handle simple case: both empty
    if (oldArray.length === 0 && newArray.length === 0) {
        return;
    }
    // Handle simple case: old empty, new has items
    if (oldArray.length === 0) {
        for (let i = 0; i < newArray.length; i++) {
            const node = newArray[i];
            if (node) {
                patches.push({ type: 'CREATE', node, index: i });
            }
        }
        return;
    }
    // Handle simple case: new empty, old has items
    if (newArray.length === 0) {
        for (let i = 0; i < oldArray.length; i++) {
            patches.push({ type: 'REMOVE', index: parentIndex + i });
        }
        return;
    }
    // Both have children - use keyed diff
    keyedDiff(oldArray, newArray, patches, parentIndex);
}
/**
 * Normalize children to array
 */
function normalizeChildren(children) {
    if (children === null || children === undefined) {
        return [];
    }
    if (typeof children === 'string') {
        // Text node - return as single element
        return [{
                type: Symbol.for('feed.text'),
                props: null,
                children: children,
                key: '',
            }];
    }
    return children;
}
/**
 * Keyed diff algorithm - O(n*m) but produces minimal patches
 *
 * This implements a simplified version of the keyed diff algorithm:
 * 1. Match nodes by key
 * 2. Reorder matched nodes
 * 3. Create/remove unmatched nodes
 */
function keyedDiff(oldArray, newArray, patches, parentIndex) {
    // Build key maps
    const oldKeyMap = new Map();
    const newKeyMap = new Map();
    // Index keyed nodes
    for (let i = 0; i < oldArray.length; i++) {
        const node = oldArray[i];
        if (!node)
            continue;
        const key = node.key;
        if (key) {
            oldKeyMap.set(key, { node, index: i });
        }
    }
    for (let i = 0; i < newArray.length; i++) {
        const node = newArray[i];
        if (!node)
            continue;
        const key = node.key;
        if (key) {
            newKeyMap.set(key, { node, index: i });
        }
    }
    // Process new array
    let oldIndex = 0;
    for (let newIndex = 0; newIndex < newArray.length; newIndex++) {
        const newNode = newArray[newIndex];
        if (!newNode) {
            // Skip undefined nodes but still track the position
            oldIndex++;
            continue;
        }
        const key = newNode.key;
        if (key && oldKeyMap.has(key)) {
            // Keyed match found
            const oldMatch = oldKeyMap.get(key);
            if (!oldMatch)
                continue;
            // Diff the matched nodes
            diffNodes(oldMatch.node, newNode, patches, parentIndex + newIndex);
            // Handle move if indices differ
            if (oldMatch.index !== newIndex) {
                patches.push({
                    type: 'MOVE',
                    from: oldMatch.index,
                    to: newIndex
                });
            }
            oldIndex = oldMatch.index + 1;
        }
        else {
            // No key match - check for type match at current position
            if (oldIndex < oldArray.length) {
                const oldNode = oldArray[oldIndex];
                if (!oldNode) {
                    patches.push({ type: 'CREATE', node: newNode, index: newIndex });
                    oldIndex++;
                    continue;
                }
                if (oldNode.type === newNode.type && !oldNode.key) {
                    // Same type, diff them
                    diffNodes(oldNode, newNode, patches, parentIndex + newIndex);
                    oldIndex++;
                }
                else {
                    // Create new node
                    patches.push({ type: 'CREATE', node: newNode, index: newIndex });
                }
            }
            else {
                // No more old nodes - create
                patches.push({ type: 'CREATE', node: newNode, index: newIndex });
            }
        }
    }
    // Remove remaining old nodes
    for (let i = oldIndex; i < oldArray.length; i++) {
        const oldNode = oldArray[i];
        if (!oldNode)
            continue;
        if (!oldNode.key || !newKeyMap.has(oldNode.key)) {
            patches.push({ type: 'REMOVE', index: parentIndex + i });
        }
    }
}
/**
 * Apply patches to a VNode tree (for testing)
 *
 * Note: This is a simplified implementation. In production,
 * the runtime would apply these patches to the actual DOM.
 */
export function applyPatches(tree, patches) {
    // Deep clone to avoid mutation
    const result = JSON.parse(JSON.stringify(tree));
    for (const patch of patches) {
        switch (patch.type) {
            case 'REPLACE':
                // In a real implementation, we'd replace at the correct index
                break;
            case 'UPDATE_PROPS':
                if (result.props && patch.props) {
                    Object.assign(result.props, patch.props);
                }
                break;
            case 'CREATE':
            case 'REMOVE':
            case 'MOVE':
                // These would be handled by the runtime
                break;
        }
    }
    return result;
}
//# sourceMappingURL=diff.js.map