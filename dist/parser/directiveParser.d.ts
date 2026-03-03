/**
 * FeedJS Core - Directive Parser
 *
 * Parses and normalizes Feed directives from HTML attributes.
 * All directives are prefixed with 'f-'.
 */
import type { FeedDirective, ForLoopData } from '../ast/nodes.js';
/**
 * Check if an attribute name is a Feed directive
 */
export declare function isDirective(attrName: string): boolean;
/**
 * Parse a directive attribute name and value into a normalized directive
 *
 * Examples:
 * - f-if="count > 0" -> { type: 'if', name: 'f-if', value: 'count > 0', expression: 'count > 0' }
 * - f-for="item in items" -> { type: 'for', name: 'f-for', value: 'item in items', expression: 'item in items' }
 * - f-bind:value="name" -> { type: 'bind', name: 'f-bind:value', value: 'name', expression: 'name' }
 * - f-on:click="handleClick" -> { type: 'on', name: 'f-on:click', value: 'handleClick', expression: 'handleClick' }
 */
export declare function parseDirective(attrName: string, attrValue: string): FeedDirective;
/**
 * Parse for loop expression
 *
 * Format: "item in items" or "(item, index) in items"
 */
export declare function parseForLoop(expression: string): ForLoopData;
/**
 * Parse if/else-if/else expression
 */
export declare function parseIfExpression(expression: string): string;
/**
 * Check if an element has conditional rendering directives
 */
export declare function hasConditionalDirectives(directives: FeedDirective[]): boolean;
/**
 * Check if an element has list rendering directives
 */
export declare function hasListDirectives(directives: FeedDirective[]): boolean;
//# sourceMappingURL=directiveParser.d.ts.map