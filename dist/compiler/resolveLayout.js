/**
 * FeedJS Core - Layout Resolution
 *
 * Resolves compile-time layout inheritance.
 * This module processes:
 * - <layout> and <feed-layout> elements for page-level layouts
 * - f:inherit attribute for element-level inheritance
 */
import { parseTemplate } from '../parser/htmlParser.js';
/**
 * Detect if the AST uses a layout and resolve it
 *
 * @param ast - The page AST
 * @param resolveLayoutFile - Function to resolve layout file path to content
 * @returns Processed AST with layout merged
 */
export function resolveLayout(ast, resolveLayoutFile) {
    const nodes = ast.nodes;
    // Check for layout at root level
    const layoutNodes = nodes.filter(isFeedLayout);
    // No layout - return as-is
    if (layoutNodes.length === 0) {
        return ast;
    }
    const layoutNode = layoutNodes[0];
    // Get layout src attribute
    const src = layoutNode.attributes['src'];
    if (!src) {
        throw new CompileError('Layout file missing src attribute', ast.source);
    }
    // Load and parse layout
    let layoutContent;
    try {
        layoutContent = resolveLayoutFile(src);
    }
    catch (error) {
        console.error(`Error resolving layout file: ${src}`, error);
        throw new CompileError(`Failed to load layout file: ${src}`, ast.source);
    }
    const layoutAST = parseTemplate(layoutContent);
    // Get the page content (children of <layout> tag)
    const pageContent = layoutNode.children || [];
    // Merge the layout with page content
    // The page content becomes the default slot content
    const mergedNodes = mergeSlots(layoutAST.nodes, new Map(), // template blocks
    new Map(), // slot placeholders
    pageContent, // default content = page content
    ast.source);
    return {
        type: 'FeedAST',
        nodes: mergedNodes,
        source: ast.source,
    };
}
/**
 * Check if a node is a layout element (supports both <layout> and <feed-layout>)
 */
function isFeedLayout(node) {
    if (node.type === 'Element') {
        return node.tag === 'layout' || node.tag === 'feed-layout';
    }
    return false;
}
/**
 * Check if an element has f:inherit attribute
 */
function hasInherit(node) {
    if (node.type === 'Element') {
        return 'f:inherit' in node.attributes;
    }
    return false;
}
/**
 * Get f:inherit value from element
 */
function getInheritSrc(node) {
    if (node.type === 'Element') {
        return node.attributes['f:inherit'];
    }
    return undefined;
}
/**
 * Process f:inherit attributes in AST nodes
 * Replaces elements with f:inherit with content from the inherited file
 */
function processInherit(nodes, resolveLayoutFile) {
    const result = [];
    for (const node of nodes) {
        if (node.type === 'Element' && hasInherit(node)) {
            const inheritSrc = getInheritSrc(node);
            if (inheritSrc) {
                try {
                    const inheritContent = resolveLayoutFile(inheritSrc);
                    const inheritAST = parseTemplate(inheritContent);
                    // Get the first element from the inherited file
                    const inheritElement = inheritAST.nodes.find(n => n.type === 'Element');
                    if (inheritElement && inheritElement.type === 'Element') {
                        const inheritedEl = inheritElement;
                        // Merge: use inherited element's tag, but keep current element's props and children
                        const mergedElement = {
                            ...inheritedEl,
                            attributes: { ...inheritedEl.attributes, ...node.attributes },
                            // Remove f:inherit from final element
                            directives: node.directives?.filter(d => d.name !== 'f:inherit') || [],
                            children: node.children || inheritedEl.children,
                        };
                        result.push(mergedElement);
                    }
                }
                catch (e) {
                    throw new CompileError(`Failed to load inherited file: ${inheritSrc}`, node.type === 'Element' ? node.source || '' : '');
                }
            }
        }
        else if (node.type === 'Element' && node.children) {
            // Recursively process children
            const processedChildren = processInherit(node.children, resolveLayoutFile);
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
 * Extract template blocks from children
 */
function extractTemplateBlocks(children) {
    const templates = new Map();
    for (const child of children) {
        if (child.type === 'TemplateBlock') {
            const templateNode = child;
            if (templates.has(templateNode.name)) {
                throw new CompileError(`Duplicate template slot: ${templateNode.name}`, '');
            }
            templates.set(templateNode.name, templateNode.children);
        }
    }
    return templates;
}
/**
 * Extract slot placeholders from children
 */
function extractSlotPlaceholders(children) {
    const slots = new Map();
    for (const child of children) {
        if (child.type === 'SlotPlaceholder') {
            const slotNode = child;
            if (slots.has(slotNode.name)) {
                throw new CompileError(`Duplicate slot usage: ${slotNode.name}`, '');
            }
            slots.set(slotNode.name, slotNode.children);
        }
    }
    return slots;
}
/**
 * Merge slots into layout AST
 */
function mergeSlots(layoutNodes, templateBlocks, slotPlaceholders, defaultContent, source) {
    const result = [];
    for (const node of layoutNodes) {
        if (node.type === 'Slot') {
            const slotNode = node;
            const slotName = slotNode.name || 'default';
            // Check for template block first
            if (templateBlocks.has(slotName)) {
                result.push(...templateBlocks.get(slotName));
            }
            // Then check for slot placeholders
            else if (slotPlaceholders.has(slotName)) {
                result.push(...slotPlaceholders.get(slotName));
            }
            // Check for fallback
            else if (slotNode.fallback && slotNode.fallback.length > 0) {
                result.push(...slotNode.fallback);
            }
            // No content provided - error for named slots
            else if (slotName !== 'default') {
                throw new CompileError(`Missing slot content for: ${slotName}`, source);
            }
            // Default slot - use page content
            else if (defaultContent.length > 0) {
                result.push(...defaultContent);
            }
        }
        else if (node.type === 'Element' && node.children) {
            const processedChildren = mergeSlots(node.children, templateBlocks, slotPlaceholders, defaultContent, source);
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
 * Compile error class
 */
export class CompileError extends Error {
    constructor(message, source) {
        super(message);
        this.source = source;
        this.name = 'CompileError';
    }
}
//# sourceMappingURL=resolveLayout.js.map