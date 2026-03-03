// FeedJS Core - Main Entry Point
// Re-export all public APIs
// Re-export parser
export { parseTemplate } from './parser/htmlParser.js';
// Re-export IR
export { transformAST, } from './ir/transform.js';
// Re-export VDOM
export { createVDOM, FragmentSymbol, TextSymbol, isTextVNode, isFragment, getVNodeType, } from './vdom/vnode.js';
// Re-export diff types and functions
export { diff, applyPatches } from './vdom/diff.js';
// Re-export compiler utilities
export { resolveLayout, CompileError } from './compiler/resolveLayout.js';
export { mergeSlots, extractSlots } from './compiler/mergeSlots.js';
//# sourceMappingURL=index.js.map