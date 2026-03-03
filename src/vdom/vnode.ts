/**
 * FeedJS Core - VDOM Node Types
 * 
 * Defines the Virtual DOM (VDOM) node structure.
 * VDOM is platform-agnostic and represents the renderable tree.
 */

import type { IRNode } from '../ir/transform.js';

// Symbol for element type
export const FragmentSymbol = Symbol.for('feed.fragment');
export const TextSymbol = Symbol.for('feed.text');

// VDOM Node
export interface VNode {
  type: string | symbol;
  props: VNodeProps | null;
  children: VNodeChild;
  key: string;
  interpolation?: string; // {{ expression }} interpolation
  // Include directives for runtime execution
  directives?: Array<{
    type: string;
    name: string;
    value: string;
    expression: string;
    modifiers?: string[];
  }>;
}

// VDOM Props
export interface VNodeProps {
  [key: string]: VNodePropValue;
}

export type VNodePropValue = string | number | boolean | null | undefined;

// VDOM Child - can be VNode or string
export type VNodeChild = VNode[] | string | null;

// State interface for runtime evaluation
export interface VNodeState {
  [key: string]: unknown;
}

/**
 * Create a VDOM node from IR
 * 
 * @param ir - The IR node(s) to convert
 * @param state - The current state for evaluating expressions
 * @returns VNode
 */
export function createVDOM(ir: IRNode | IRNode[], state: VNodeState): VNode {
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
function createVNodeFromIR(ir: IRNode, state: VNodeState): VNode {
  if (ir.kind === 'text') {
    return createTextVNode(ir.value ?? '', state, ir);
  }
  
  if (ir.kind === 'fragment') {
    return createFragmentVNode(ir.children ?? [], state);
  }
  
  return createElementVNode(ir, state);
}

/**
 * Create an element VNode
 */
function createElementVNode(ir: IRNode, state: VNodeState): VNode {
  const props: VNodeProps = {};
  
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
  let children: VNodeChild = null;
  
  if (ir.children && ir.children.length > 0) {
    const childNodes: VNode[] = [];
    
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
function createTextVNode(value: string, state: VNodeState, ir?: IRNode): VNode {
  // Check for interpolation
  if (ir?.interpolation) {
    const interpValue = evaluateExpression(ir.interpolation, state);
    return {
      type: TextSymbol,
      props: null,
      children: String(interpValue ?? ''),
      key: '',
      interpolation: ir.interpolation,
    };
  }
  
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
function createFragmentVNode(children: IRNode[], state: VNodeState): VNode {
  const childNodes: VNode[] = [];
  
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
function processDirective(
  directive: { type: string; name: string; value: string; expression?: string },
  props: VNodeProps,
  state: VNodeState
): void {
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
function evaluateExpression(expr: string, state: VNodeState): unknown {
  if (!expr) return expr;
  
  // Handle string literals
  if ((expr.startsWith('"') && expr.endsWith('"')) || 
      (expr.startsWith("'") && expr.endsWith("'"))) {
    return expr.slice(1, -1);
  }
  
  // Handle boolean literals
  if (expr === 'true') return true;
  if (expr === 'false') return false;
  
  // Handle numeric literals
  const num = Number(expr);
  if (!isNaN(num)) return num;
  
  // Handle null/undefined
  if (expr === 'null') return null;
  if (expr === 'undefined') return undefined;
  
  // Handle property access (e.g., item.name, items[0])
  if (expr.includes('.')) {
    const parts = expr.split('.');
    let value: unknown = state;
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[part];
      } else {
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
export function isTextVNode(node: VNode): boolean {
  return node.type === TextSymbol;
}

/**
 * Check if VNode is a fragment
 */
export function isFragment(node: VNode): boolean {
  return node.type === FragmentSymbol;
}

/**
 * Get the type name of a VNode
 */
export function getVNodeType(node: VNode): string {
  if (typeof node.type === 'symbol') {
    if (node.type === TextSymbol) return 'text';
    if (node.type === FragmentSymbol) return 'fragment';
    return 'unknown';
  }
  return node.type;
}
