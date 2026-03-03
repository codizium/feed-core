/**
 * FeedJS Core - HTML Parser
 *
 * Parses HTML templates into Feed AST nodes.
 * Handles standard HTML elements, text, comments, and Feed directives.
 */
import { isDirective, parseDirective } from './directiveParser.js';
// Simple HTML tokenizer
function tokenize(html) {
    const tokens = [];
    let pos = 0;
    while (pos < html.length) {
        // Check for comment
        if (html.slice(pos, pos + 4) === '<!--') {
            const end = html.indexOf('-->', pos + 4);
            if (end === -1) {
                tokens.push({ type: 'comment', value: html.slice(pos), attributes: {} });
                break;
            }
            tokens.push({ type: 'comment', value: html.slice(pos + 4, end), attributes: {} });
            pos = end + 3;
            continue;
        }
        // Check for tag open or self-closing
        if (html[pos] === '<') {
            const nextChar = html[pos + 1] ?? '';
            // Check for closing tag
            if (nextChar === '/') {
                const end = html.indexOf('>', pos + 2);
                if (end === -1)
                    break;
                const tagName = html.slice(pos + 2, end).trim();
                tokens.push({ type: 'tagClose', value: '</' + tagName + '>', tagName, attributes: {} });
                pos = end + 1;
                continue;
            }
            // Check for doctype
            if (nextChar === '!') {
                const end = html.indexOf('>', pos + 2);
                if (end === -1)
                    break;
                tokens.push({ type: 'doctype', value: html.slice(pos, end + 1), attributes: {} });
                pos = end + 1;
                continue;
            }
            // Self-closing tag
            if (nextChar === ' ') {
                pos++;
                continue;
            }
            // Parse opening tag
            const end = html.indexOf('>', pos + 1);
            if (end === -1)
                break;
            const tagContent = html.slice(pos + 1, end);
            const selfClosing = tagContent.endsWith('/');
            const cleanContent = selfClosing ? tagContent.slice(0, -1) : tagContent;
            // Parse tag name and attributes - use simpler regex
            const spaceIndex = cleanContent.search(/[\s\/]/);
            let tagName;
            let attrString;
            if (spaceIndex === -1) {
                tagName = cleanContent;
                attrString = '';
            }
            else {
                tagName = cleanContent.slice(0, spaceIndex);
                attrString = cleanContent.slice(spaceIndex);
            }
            if (!tagName) {
                pos++;
                continue;
            }
            const attributes = parseAttributes(attrString);
            if (selfClosing || isSelfClosingTag(tagName)) {
                tokens.push({
                    type: 'tagSelfClosing',
                    value: '<' + tagName + '>',
                    tagName: tagName.toLowerCase(),
                    attributes,
                    selfClosing: true
                });
            }
            else {
                tokens.push({
                    type: 'tagOpen',
                    value: '<' + tagName + '>',
                    tagName: tagName.toLowerCase(),
                    attributes
                });
            }
            pos = end + 1;
            continue;
        }
        // Text content
        const nextTag = html.indexOf('<', pos);
        if (nextTag === -1) {
            const text = html.slice(pos).trim();
            if (text) {
                tokens.push({ type: 'text', value: text, attributes: {} });
            }
            break;
        }
        const text = html.slice(pos, nextTag).trim();
        if (text) {
            tokens.push({ type: 'text', value: text, attributes: {} });
        }
        pos = nextTag;
    }
    return tokens;
}
// Parse HTML attributes string into key-value map
function parseAttributes(attrString) {
    const attributes = {};
    // Match attribute patterns: name="value", name='value', name=value, name
    const attrRegex = /([\w:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let match;
    while ((match = attrRegex.exec(attrString)) !== null) {
        const name = match[1];
        const doubleQuoted = match[2];
        const singleQuoted = match[3];
        const unquoted = match[4];
        if (!name)
            continue;
        const value = doubleQuoted ?? singleQuoted ?? unquoted ?? '';
        attributes[name] = value;
    }
    return attributes;
}
// Check if tag is self-closing
function isSelfClosingTag(tagName) {
    const selfClosingTags = [
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr'
    ];
    return selfClosingTags.includes(tagName.toLowerCase());
}
/**
 * Parse HTML template string into Feed AST
 */
export function parseTemplate(html) {
    const tokens = tokenize(html);
    const state = { tokens, pos: 0 };
    const nodes = parseNodes(state);
    return {
        type: 'FeedAST',
        nodes,
        source: html,
    };
}
/**
 * Parse nodes recursively
 */
function parseNodes(state) {
    const nodes = [];
    while (state.pos < state.tokens.length) {
        const token = state.tokens[state.pos];
        if (!token) {
            state.pos++;
            continue;
        }
        if (token.type === 'tagClose') {
            // Stop parsing siblings - we've closed a parent tag
            break;
        }
        if (token.type === 'text') {
            nodes.push(createTextNode(token.value));
            state.pos++;
            continue;
        }
        if (token.type === 'comment') {
            nodes.push(createCommentNode(token.value));
            state.pos++;
            continue;
        }
        if (token.type === 'tagOpen' || token.type === 'tagSelfClosing') {
            const node = parseElement(state, token);
            nodes.push(node);
            continue;
        }
        // Skip doctype and other tokens
        state.pos++;
    }
    return nodes;
}
/**
 * Parse a single element
 */
function parseElement(state, token) {
    const tagName = token.tagName ?? '';
    const attributes = token.attributes ?? {};
    // Handle special elements: slot, template
    if (tagName === 'slot') {
        return parseSlotElement(state, token);
    }
    if (tagName === 'template') {
        return parseTemplateElement(state, token);
    }
    // Regular element parsing
    return parseRegularElement(state, token);
}
/**
 * Parse a slot element
 */
function parseSlotElement(state, token) {
    const attributes = token.attributes ?? {};
    const name = attributes['name'] || '';
    const children = [];
    if (!token.selfClosing) {
        state.pos++;
        while (state.pos < state.tokens.length) {
            const currentToken = state.tokens[state.pos];
            if (!currentToken) {
                state.pos++;
                continue;
            }
            if (currentToken.type === 'tagClose' && currentToken.tagName === 'slot') {
                state.pos++;
                break;
            }
            const childNodes = parseNodes(state);
            children.push(...childNodes);
        }
    }
    else {
        state.pos++;
    }
    return {
        type: 'Slot',
        name,
        fallback: children.length > 0 ? children : [],
    };
}
/**
 * Parse a template element
 */
function parseTemplateElement(state, token) {
    const attributes = token.attributes ?? {};
    // Get slot name from #name syntax or v-slot:name
    let name = '';
    if (attributes['#']) {
        name = attributes['#'];
    }
    else if (attributes['v-slot']) {
        name = attributes['v-slot'];
    }
    else if (attributes['slot']) {
        name = attributes['slot'];
    }
    const children = [];
    if (!token.selfClosing) {
        state.pos++;
        while (state.pos < state.tokens.length) {
            const currentToken = state.tokens[state.pos];
            if (!currentToken) {
                state.pos++;
                continue;
            }
            if (currentToken.type === 'tagClose' && currentToken.tagName === 'template') {
                state.pos++;
                break;
            }
            const childNodes = parseNodes(state);
            children.push(...childNodes);
        }
    }
    else {
        state.pos++;
    }
    return {
        type: 'TemplateBlock',
        name,
        children,
    };
}
/**
 * Parse a regular element (non-special)
 */
function parseRegularElement(state, token) {
    const tagName = token.tagName ?? '';
    const attributes = token.attributes ?? {};
    // Separate directives from regular attributes
    const regularAttrs = {};
    const directives = [];
    for (const [key, value] of Object.entries(attributes)) {
        if (isDirective(key)) {
            directives.push(parseDirective(key, value));
        }
        else {
            regularAttrs[key] = value;
        }
    }
    const children = [];
    if (!token.selfClosing) {
        state.pos++;
        // Parse children until we find the closing tag
        while (state.pos < state.tokens.length) {
            const currentToken = state.tokens[state.pos];
            if (!currentToken) {
                state.pos++;
                continue;
            }
            if (currentToken.type === 'tagClose' && currentToken.tagName === tagName) {
                // Found closing tag
                state.pos++;
                break;
            }
            // Parse child nodes
            const childNodes = parseNodes(state);
            children.push(...childNodes);
        }
    }
    else {
        state.pos++;
    }
    return {
        type: 'Element',
        tag: tagName,
        attributes: regularAttrs,
        directives,
        children,
    };
}
/**
 * Create a text node
 */
function createTextNode(value) {
    return {
        type: 'Text',
        value,
    };
}
/**
 * Create a comment node
 */
function createCommentNode(value) {
    return {
        type: 'Comment',
        value,
    };
}
//# sourceMappingURL=htmlParser.js.map