/**
 * FeedJS Core - AST Node Types
 * 
 * Defines the formal AST (Abstract Syntax Tree) for Feed templates.
 * This is the intermediate representation after parsing HTML templates.
 */

// Base node types
export type FeedASTNodeType = 'Element' | 'Text' | 'Comment' | 'Fragment' | 'Slot' | 'SlotPlaceholder' | 'TemplateBlock';

// Directive types
export type DirectiveType = 
  | 'if' 
  | 'else' 
  | 'for' 
  | 'key' 
  | 'text' 
  | 'html' 
  | 'bind' 
  | 'on';

// Base interface for all AST nodes
export interface BaseFeedASTNode {
  type: FeedASTNodeType;
}

// Element node (HTML tags with directives)
export interface FeedElementNode extends BaseFeedASTNode {
  type: 'Element';
  tag: string;
  attributes: Record<string, string>;
  directives: FeedDirective[];
  children: FeedASTNode[];
}

// Text node (static text content or interpolation)
export interface FeedTextNode extends BaseFeedASTNode {
  type: 'Text';
  value: string;
  interpolation?: string; // Expression for {{ expression }} interpolation
}

// Comment node (HTML comments)
export interface FeedCommentNode extends BaseFeedASTNode {
  type: 'Comment';
  value: string;
}

// Fragment node (logical grouping)
export interface FeedFragmentNode extends BaseFeedASTNode {
  type: 'Fragment';
  children: FeedASTNode[];
}

// Slot node (represents <slot> in layout)
export interface FeedSlotNode extends BaseFeedASTNode {
  type: 'Slot';
  name: string; // slot name, empty for default slot
  fallback: FeedASTNode[]; // fallback content (empty array if none)
}

// Slot placeholder node (represents a named slot in page)
export interface FeedSlotPlaceholderNode extends BaseFeedASTNode {
  type: 'SlotPlaceholder';
  name: string; // slot name
  children: FeedASTNode[];
}

// Template block node (represents <template #name> in page)
export interface FeedTemplateBlockNode extends BaseFeedASTNode {
  type: 'TemplateBlock';
  name: string; // slot name
  children: FeedASTNode[];
}

// Union type for all AST nodes
export type FeedASTNode = 
  | FeedElementNode 
  | FeedTextNode 
  | FeedCommentNode 
  | FeedFragmentNode
  | FeedSlotNode
  | FeedSlotPlaceholderNode
  | FeedTemplateBlockNode;

// Directive interface
export interface FeedDirective {
  type: DirectiveType;
  name: string;
  value: string;
  expression?: string;
  modifiers?: string[];
}

// For loop directive data
export interface ForLoopData {
  item: string;
  index: string;
  collection: string;
}

// If directive data  
export interface IfData {
  condition: string;
  branches: IfBranch[];
}

export interface IfBranch {
  condition: string | null; // null for else
  nodes: FeedASTNode[];
}

// Key directive data
export interface KeyData {
  expression: string;
}

// Text binding directive data
export interface TextData {
  expression: string;
}

// HTML binding directive data
export interface HtmlData {
  expression: string;
}

// Attribute binding directive data
export interface BindData {
  attribute: string;
  expression: string;
}

// Event binding directive data
export interface OnData {
  event: string;
  expression: string;
  modifiers?: string[];
}

// Complete AST root
export interface FeedAST {
  type: 'FeedAST';
  nodes: FeedASTNode[];
  source: string;
}
