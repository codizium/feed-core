// FeedJS Core - Main Entry Point
// Re-export all public APIs

// Re-export parser
export { parseTemplate } from './parser/htmlParser.js';

// Re-export AST types
export type {
  FeedAST,
  FeedASTNode,
  FeedASTNodeType,
  DirectiveType,
  BaseFeedASTNode,
  FeedElementNode,
  FeedTextNode,
  FeedCommentNode,
  FeedFragmentNode,
  FeedSlotNode,
  FeedSlotPlaceholderNode,
  FeedTemplateBlockNode,
} from './ast/nodes.js';

// Re-export IR
export {
  transformAST,
  type IRNode,
  type IRNodeKind,
  type IRProps,
  type IRDirective,
} from './ir/transform.js';

// Re-export VDOM
export {
  createVDOM,
  FragmentSymbol,
  TextSymbol,
  isTextVNode,
  isFragment,
  getVNodeType,
  type VNode,
  type VNodeProps,
  type VNodePropValue,
  type VNodeChild,
  type VNodeState,
} from './vdom/vnode.js';

// Re-export diff types and functions
export { diff, applyPatches, type Patch, type PatchType, type PatchList } from './vdom/diff.js';

// Re-export compiler utilities
export { resolveLayout, CompileError } from './compiler/resolveLayout.js';
export { mergeSlots, extractSlots } from './compiler/mergeSlots.js';
