export { parseTemplate } from './parser/htmlParser.js';
export type { FeedAST, FeedASTNode, FeedASTNodeType, DirectiveType, BaseFeedASTNode, FeedElementNode, FeedTextNode, FeedCommentNode, FeedFragmentNode, FeedSlotNode, FeedSlotPlaceholderNode, FeedTemplateBlockNode, } from './ast/nodes.js';
export { transformAST, type IRNode, type IRNodeKind, type IRProps, type IRDirective, } from './ir/transform.js';
export { createVDOM, FragmentSymbol, TextSymbol, isTextVNode, isFragment, getVNodeType, type VNode, type VNodeProps, type VNodePropValue, type VNodeChild, type VNodeState, } from './vdom/vnode.js';
export { diff, applyPatches, type Patch, type PatchType, type PatchList } from './vdom/diff.js';
export { resolveLayout, CompileError } from './compiler/resolveLayout.js';
export { mergeSlots, extractSlots } from './compiler/mergeSlots.js';
//# sourceMappingURL=index.d.ts.map