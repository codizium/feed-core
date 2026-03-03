/**
 * FeedJS Core - AST Node Types
 *
 * Defines the formal AST (Abstract Syntax Tree) for Feed templates.
 * This is the intermediate representation after parsing HTML templates.
 */
export type FeedASTNodeType = 'Element' | 'Text' | 'Comment' | 'Fragment' | 'Slot' | 'SlotPlaceholder' | 'TemplateBlock';
export type DirectiveType = 'if' | 'else' | 'for' | 'key' | 'text' | 'html' | 'bind' | 'on';
export interface BaseFeedASTNode {
    type: FeedASTNodeType;
}
export interface FeedElementNode extends BaseFeedASTNode {
    type: 'Element';
    tag: string;
    attributes: Record<string, string>;
    directives: FeedDirective[];
    children: FeedASTNode[];
}
export interface FeedTextNode extends BaseFeedASTNode {
    type: 'Text';
    value: string;
    interpolation?: string;
}
export interface FeedCommentNode extends BaseFeedASTNode {
    type: 'Comment';
    value: string;
}
export interface FeedFragmentNode extends BaseFeedASTNode {
    type: 'Fragment';
    children: FeedASTNode[];
}
export interface FeedSlotNode extends BaseFeedASTNode {
    type: 'Slot';
    name: string;
    fallback: FeedASTNode[];
}
export interface FeedSlotPlaceholderNode extends BaseFeedASTNode {
    type: 'SlotPlaceholder';
    name: string;
    children: FeedASTNode[];
}
export interface FeedTemplateBlockNode extends BaseFeedASTNode {
    type: 'TemplateBlock';
    name: string;
    children: FeedASTNode[];
}
export type FeedASTNode = FeedElementNode | FeedTextNode | FeedCommentNode | FeedFragmentNode | FeedSlotNode | FeedSlotPlaceholderNode | FeedTemplateBlockNode;
export interface FeedDirective {
    type: DirectiveType;
    name: string;
    value: string;
    expression?: string;
    modifiers?: string[];
}
export interface ForLoopData {
    item: string;
    index: string;
    collection: string;
}
export interface IfData {
    condition: string;
    branches: IfBranch[];
}
export interface IfBranch {
    condition: string | null;
    nodes: FeedASTNode[];
}
export interface KeyData {
    expression: string;
}
export interface TextData {
    expression: string;
}
export interface HtmlData {
    expression: string;
}
export interface BindData {
    attribute: string;
    expression: string;
}
export interface OnData {
    event: string;
    expression: string;
    modifiers?: string[];
}
export interface FeedAST {
    type: 'FeedAST';
    nodes: FeedASTNode[];
    source: string;
}
//# sourceMappingURL=nodes.d.ts.map