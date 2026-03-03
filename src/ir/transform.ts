/**
 * FeedJS Core - IR Transformer
 * 
 * Transforms the Feed AST into an Intermediate Representation (IR).
 * IR is a normalized, explicit representation without raw strings or HTML parsing logic.
 */

import type { 
  FeedAST, 
  FeedASTNode, 
  FeedElementNode, 
  FeedTextNode, 
  FeedCommentNode,
  FeedDirective 
} from '../ast/nodes.js';

// IR Node kinds
export type IRNodeKind = 'element' | 'text' | 'fragment';

// IR Props
export interface IRProps {
  [key: string]: IRPropValue;
}

export type IRPropValue = string | number | boolean | undefined;

// IR Node - all fields optional to avoid exactOptionalPropertyTypes issues
export interface IRNode {
  kind: IRNodeKind;
  tag?: string;
  props?: IRProps;
  children?: IRNode[];
  key?: string;
  directives?: IRDirective[];
  value?: string;
  interpolation?: string; // {{ expression }} interpolation
}

// IR Directive - normalized from FeedDirective
export interface IRDirective {
  type: string;
  name: string;
  value: string;
  expression: string;
  modifiers: string[];
}

// For loop metadata
export interface IRForLoop {
  item: string;
  index: string;
  collection: string;
  body: IRNode[];
}

// Conditional branch
export interface IRConditionalBranch {
  condition: string | null; // null for else
  nodes: IRNode[];
}

/**
 * Transform Feed AST to IR
 */
export function transformAST(ast: FeedAST): IRNode[] {
  return ast.nodes.map(transformNode);
}

/**
 * Transform a single AST node to IR
 */
function transformNode(node: FeedASTNode): IRNode {
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
function transformElement(node: FeedElementNode): IRNode {
  const props: IRProps = {};
  
  // Transform static attributes
  for (const [key, value] of Object.entries(node.attributes)) {
    props[key] = value;
  }
  
  // Extract and transform directives
  const directives: IRDirective[] = [];
  let key: string = '';
  let forLoop: IRForLoop | undefined;
  
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
  let children: IRNode[];
  
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
function transformDirective(directive: FeedDirective): IRDirective {
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
function transformText(node: FeedTextNode): IRNode {
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
function transformFragment(node: { children: FeedASTNode[] }): IRNode {
  return {
    kind: 'fragment',
    children: node.children.map(transformNode),
  };
}

/**
 * Check if an IR node has conditional directives
 */
export function hasConditionals(node: IRNode): boolean {
  if (!node.directives) return false;
  return node.directives.some(d => d.type === 'if' || d.type === 'else');
}

/**
 * Check if an IR node has a for loop
 */
export function hasForLoop(node: IRNode): boolean {
  if (!node.directives) return false;
  return node.directives.some(d => d.type === 'for');
}

/**
 * Get key from IR node
 */
export function getKey(node: IRNode): string | number | undefined {
  return node.key;
}
