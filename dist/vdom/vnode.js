/**
 * FeedJS Core - VDOM Node Types
 *
 * Defines the Virtual DOM (VDOM) node structure.
 * VDOM is platform-agnostic and represents the renderable tree.
 */
// Symbol for element type
export const FragmentSymbol = Symbol.for('feedjs.fragment');
export const TextSymbol = Symbol.for('feedjs.text');
/**
 * Create a VDOM node from IR
 *
 * @param ir - The IR node(s) to convert
 * @param state - The current state for evaluating expressions
 * @returns VNode
 */
export function createVDOM(ir, state) {
    // Handle array of IR nodes
    if (Array.isArray(ir)) {
        // Create a fragment to hold multiple root nodes
        const fragment = createFragmentVNode(ir, state);
        return fragment;
    }
    return createVNodeFromIR(ir, state);
}
/**
 * Create VNode from IR node
 */
function createVNodeFromIR(ir, state) {
    if (ir.kind === 'text') {
        return createTextVNode(ir.value ?? '', state);
    }
    if (ir.kind === 'fragment') {
        return createFragmentVNode(ir.children ?? [], state);
    }
    return createElementVNode(ir, state);
}
/**
 * Create an element VNode
 */
function createElementVNode(ir, state) {
    const props = {};
    // Process static props
    if (ir.props) {
        for (const [key, value] of Object.entries(ir.props)) {
            props[key] = value;
        }
    }
    // Process directives
    if (ir.directives) {
        for (const directive of ir.directives) {
            processDirective(directive, props, state);
        }
    }
    // Process children
    let children = null;
    if (ir.children && ir.children.length > 0) {
        const childNodes = [];
        for (const childIR of ir.children) {
            const childVNode = createVNodeFromIR(childIR, state);
            childNodes.push(childVNode);
        }
        children = childNodes;
    }
    return {
        type: ir.tag ?? 'div',
        props,
        children,
        key: ir.key ?? '',
        directives: ir.directives || [],
    };
}
/**
 * Create a text VNode
 */
function createTextVNode(value, state) {
    // Don't evaluate at compile time - the runtime will handle directives
    // Just store the raw value
    return {
        type: TextSymbol,
        props: null,
        children: value,
        key: '',
    };
}
/**
 * Create a fragment VNode
 */
function createFragmentVNode(children, state) {
    const childNodes = [];
    for (const childIR of children) {
        const childVNode = createVNodeFromIR(childIR, state);
        childNodes.push(childVNode);
    }
    return {
        type: FragmentSymbol,
        props: null,
        children: childNodes,
        key: '',
    };
}
/**
 * Process a directive and update props
 */
function processDirective(directive, props, state) {
    switch (directive.type) {
        case 'text': {
            // f-text directive - set as text content
            const value = evaluateExpression(directive.expression ?? '', state);
            props['f-text'] = String(value ?? '');
            break;
        }
        case 'html': {
            // f-html directive - set as raw HTML
            const value = evaluateExpression(directive.expression ?? '', state);
            props['f-html'] = String(value ?? '');
            break;
        }
        case 'bind': {
            // f-bind:attribute - bind attribute to expression
            const attrName = directive.name.replace('f-bind:', '');
            const value = evaluateExpression(directive.expression ?? '', state);
            props[attrName] = value == null ? '' : String(value);
            break;
        }
        case 'on': {
            // f-on:event - declare event handler
            const eventName = directive.name.replace('f-on:', '');
            props[`f-on:${eventName}`] = directive.expression ?? '';
            break;
        }
        case 'if':
        case 'else':
        case 'for':
        case 'key':
            // These are handled at a higher level
            break;
    }
}
/**
 * Simple expression evaluator
 * In a real implementation, this would use a proper expression parser
 * For now, it supports simple property access and literals
 */
function evaluateExpression(expr, state) {
    if (!expr)
        return expr;
    // Handle string literals
    if ((expr.startsWith('"') && expr.endsWith('"')) ||
        (expr.startsWith("'") && expr.endsWith("'"))) {
        return expr.slice(1, -1);
    }
    // Handle boolean literals
    if (expr === 'true')
        return true;
    if (expr === 'false')
        return false;
    // Handle numeric literals
    const num = Number(expr);
    if (!isNaN(num))
        return num;
    // Handle null/undefined
    if (expr === 'null')
        return null;
    if (expr === 'undefined')
        return undefined;
    // Handle property access (e.g., item.name, items[0])
    if (expr.includes('.')) {
        const parts = expr.split('.');
        let value = state;
        for (const part of parts) {
            if (value && typeof value === 'object') {
                value = value[part];
            }
            else {
                return undefined;
            }
        }
        return value;
    }
    // Simple property name - look up in state
    return state[expr];
}
/**
 * Check if VNode is a text node
 */
export function isTextVNode(node) {
    return node.type === TextSymbol;
}
/**
 * Check if VNode is a fragment
 */
export function isFragment(node) {
    return node.type === FragmentSymbol;
}
/**
 * Get the type name of a VNode
 */
export function getVNodeType(node) {
    if (typeof node.type === 'symbol') {
        if (node.type === TextSymbol)
            return 'text';
        if (node.type === FragmentSymbol)
            return 'fragment';
        return 'unknown';
    }
    return node.type;
}
//# sourceMappingURL=vnode.js.map