/**
 * FeedJS Core - IR Transformer
 *
 * Transforms the Feed AST into an Intermediate Representation (IR).
 * IR is a normalized, explicit representation without raw strings or HTML parsing logic.
 */
/**
 * Transform Feed AST to IR
 */
export function transformAST(ast) {
    return ast.nodes.map(transformNode);
}
/**
 * Transform a single AST node to IR
 */
function transformNode(node) {
    switch (node.type) {
        case 'Element':
            return transformElement(node);
        case 'Text':
            return transformText(node);
        case 'Comment':
            // Comments are not rendered in IR - skip them
            return {
                kind: 'text',
                value: '',
            };
        case 'Fragment':
            return transformFragment(node);
        default:
            // Default to text node
            return {
                kind: 'text',
                value: '',
            };
    }
}
/**
 * Transform element node
 */
function transformElement(node) {
    const props = {};
    // Transform static attributes
    for (const [key, value] of Object.entries(node.attributes)) {
        props[key] = value;
    }
    // Extract and transform directives
    const directives = [];
    let key = '';
    let forLoop;
    for (const directive of node.directives) {
        const irDirective = transformDirective(directive);
        directives.push(irDirective);
        // Extract key
        if (directive.type === 'key' && directive.expression) {
            key = directive.expression;
        }
        // Extract for loop info for processing
        if (directive.type === 'for' && directive.expression) {
            const match = directive.expression.match(/^\s*(?:(\w+),\s*)?(\w+)\s+in\s+(\S+)\s*$/);
            if (match) {
                forLoop = {
                    item: match[2] ?? 'item',
                    index: match[1] ?? '',
                    collection: match[3] ?? '',
                    body: [],
                };
            }
        }
    }
    // Transform children
    let children;
    if (forLoop) {
        // For loop - create a wrapper that indicates iteration
        // The actual iteration happens at runtime with state
        children = node.children.map(transformNode);
        forLoop.body = children;
        // Return element with for loop directive
        return {
            kind: 'element',
            tag: node.tag,
            props,
            children,
            key,
            directives: [...directives, {
                    type: 'for',
                    name: 'f-for',
                    value: `${forLoop.item} in ${forLoop.collection}`,
                    expression: `${forLoop.item} in ${forLoop.collection}`,
                    modifiers: [],
                }],
        };
    }
    children = node.children.map(transformNode);
    return {
        kind: 'element',
        tag: node.tag,
        props,
        children,
        key,
        directives,
    };
}
/**
 * Transform directive to IR format
 */
function transformDirective(directive) {
    return {
        type: directive.type,
        name: directive.name,
        value: directive.value,
        expression: directive.expression ?? '',
        modifiers: directive.modifiers ?? [],
    };
}
/**
 * Transform text node
 */
function transformText(node) {
    // Check if this is an interpolation
    if (node.interpolation) {
        return {
            kind: 'text',
            value: '',
            interpolation: node.interpolation,
        };
    }
    return {
        kind: 'text',
        value: node.value,
    };
}
/**
 * Transform fragment node
 */
function transformFragment(node) {
    return {
        kind: 'fragment',
        children: node.children.map(transformNode),
    };
}
/**
 * Check if an IR node has conditional directives
 */
export function hasConditionals(node) {
    if (!node.directives)
        return false;
    return node.directives.some(d => d.type === 'if' || d.type === 'else');
}
/**
 * Check if an IR node has a for loop
 */
export function hasForLoop(node) {
    if (!node.directives)
        return false;
    return node.directives.some(d => d.type === 'for');
}
/**
 * Get key from IR node
 */
export function getKey(node) {
    return node.key;
}
//# sourceMappingURL=transform.js.map