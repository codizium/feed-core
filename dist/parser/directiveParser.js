/**
 * FeedJS Core - Directive Parser
 *
 * Parses and normalizes Feed directives from HTML attributes.
 * All directives are prefixed with 'f-'.
 */
const DIRECTIVE_PREFIX = 'f-';
/**
 * Check if an attribute name is a Feed directive
 */
export function isDirective(attrName) {
    return attrName.startsWith(DIRECTIVE_PREFIX);
}
/**
 * Parse a directive attribute name and value into a normalized directive
 *
 * Examples:
 * - f-if="count > 0" -> { type: 'if', name: 'f-if', value: 'count > 0', expression: 'count > 0' }
 * - f-for="item in items" -> { type: 'for', name: 'f-for', value: 'item in items', expression: 'item in items' }
 * - f-bind:value="name" -> { type: 'bind', name: 'f-bind:value', value: 'name', expression: 'name' }
 * - f-on:click="handleClick" -> { type: 'on', name: 'f-on:click', value: 'handleClick', expression: 'handleClick' }
 */
export function parseDirective(attrName, attrValue) {
    const nameWithoutPrefix = attrName.slice(DIRECTIVE_PREFIX.length);
    // Handle f-bind:* and f-on:* patterns
    if (nameWithoutPrefix.startsWith('bind:')) {
        return parseBindDirective(nameWithoutPrefix, attrValue);
    }
    if (nameWithoutPrefix.startsWith('on:')) {
        return parseEventDirective(nameWithoutPrefix, attrValue);
    }
    // Handle simple directives
    return parseSimpleDirective(nameWithoutPrefix, attrValue);
}
/**
 * Parse simple directives (if, else, for, key, text, html)
 */
function parseSimpleDirective(name, value) {
    const type = getDirectiveType(name);
    if (type === 'for') {
        return {
            type,
            name: `${DIRECTIVE_PREFIX}${name}`,
            value,
            expression: value,
        };
    }
    if (type === 'key') {
        return {
            type,
            name: `${DIRECTIVE_PREFIX}${name}`,
            value,
            expression: value,
        };
    }
    if (type === 'text') {
        return {
            type,
            name: `${DIRECTIVE_PREFIX}${name}`,
            value,
            expression: value,
        };
    }
    if (type === 'html') {
        return {
            type,
            name: `${DIRECTIVE_PREFIX}${name}`,
            value,
            expression: value,
        };
    }
    if (type === 'if' || type === 'else') {
        return {
            type,
            name: `${DIRECTIVE_PREFIX}${name}`,
            value,
            expression: value,
        };
    }
    // Default case
    return {
        type,
        name: `${DIRECTIVE_PREFIX}${name}`,
        value,
        expression: value,
    };
}
/**
 * Parse f-bind:* directives
 */
function parseBindDirective(name, value) {
    const attribute = name.slice(5); // Remove 'bind:'
    return {
        type: 'bind',
        name: `${DIRECTIVE_PREFIX}${name}`,
        value,
        expression: value,
        modifiers: [],
    };
}
/**
 * Parse f-on:* directives
 */
function parseEventDirective(name, value) {
    const event = name.slice(3); // Remove 'on:'
    // Extract modifiers from event name (e.g., click.stop -> event: click, modifiers: [stop])
    const parts = event.split('.');
    const eventName = parts[0];
    const modifiers = parts.slice(1);
    return {
        type: 'on',
        name: `${DIRECTIVE_PREFIX}${name}`,
        value,
        expression: value,
        modifiers,
    };
}
/**
 * Map directive name to directive type
 */
function getDirectiveType(name) {
    switch (name) {
        case 'if':
            return 'if';
        case 'else':
            return 'else';
        case 'for':
            return 'for';
        case 'key':
            return 'key';
        case 'text':
            return 'text';
        case 'html':
            return 'html';
        default:
            // Check for bind: and on: patterns
            if (name.startsWith('bind:'))
                return 'bind';
            if (name.startsWith('on:'))
                return 'on';
            throw new Error(`Unknown directive: ${name}`);
    }
}
/**
 * Parse for loop expression
 *
 * Format: "item in items" or "(item, index) in items"
 */
export function parseForLoop(expression) {
    const match = expression.match(/^\s*(?:(\w+),\s*)?(\w+)\s+in\s+(\S+)\s*$/);
    if (!match) {
        throw new Error(`Invalid for loop expression: ${expression}`);
    }
    const [, indexName, item, collection] = match;
    if (!item || !collection) {
        throw new Error(`Invalid for loop expression: ${expression}`);
    }
    return {
        item,
        index: indexName ?? '',
        collection,
    };
}
/**
 * Parse if/else-if/else expression
 */
export function parseIfExpression(expression) {
    return expression.trim();
}
/**
 * Check if an element has conditional rendering directives
 */
export function hasConditionalDirectives(directives) {
    return directives.some(d => d.type === 'if' || d.type === 'else');
}
/**
 * Check if an element has list rendering directives
 */
export function hasListDirectives(directives) {
    return directives.some(d => d.type === 'for');
}
//# sourceMappingURL=directiveParser.js.map