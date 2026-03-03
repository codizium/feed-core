/**
 * FeedJS Core - Layout Resolution
 * 
 * Resolves compile-time layout inheritance.
 * This module processes:
 * - <layout> and <feedjs-layout> elements for page-level layouts
 * - f:inherit attribute for element-level inheritance
 */

import { parseTemplate } from '../parser/htmlParser.js';
import type { FeedAST, FeedASTNode, FeedElementNode, FeedTemplateBlockNode, FeedSlotPlaceholderNode } from '../ast/nodes.js';

// Slot node type (imported from AST)
interface SlotNode {
  type: 'Slot';
  name: string;
  fallback?: FeedASTNode[];
}

/**
 * Detect if the AST uses a layout and resolve it
 * 
 * @param ast - The page AST
 * @param resolveLayoutFile - Function to resolve layout file path to content
 * @returns Processed AST with layout merged
 */
export function resolveLayout(
  ast: FeedAST,
  resolveLayoutFile: (src: string) => string
): FeedAST {
  const nodes = ast.nodes;
  
  // Check for layout at root level
  const layoutNodes = nodes.filter(isFeedLayout);

  // No layout - return as-is
  if (layoutNodes.length === 0) {
    return ast;
  }
  
  const layoutNode = layoutNodes[0] as FeedElementNode;
  
  // Get layout src attribute
  const src = layoutNode.attributes['src'];
  
  if (!src) {
    throw new CompileError(
      'Layout file missing src attribute',
      ast.source
    );
  }

  // Load and parse layout
  let layoutContent: string;
  try {
    layoutContent = resolveLayoutFile(src);
  } catch (error) {
    console.error(`Error resolving layout file: ${src}`, error);
    throw new CompileError(
      `Failed to load layout file: ${src}`,
      ast.source
    );
  }
  
  const layoutAST = parseTemplate(layoutContent);
  
  // Get the page content (children of <layout> tag)
  const pageContent = layoutNode.children || [];

  // Merge the layout with page content
  // The page content becomes the default slot content
  const mergedNodes = mergeSlots(
    layoutAST.nodes,
    new Map(),  // template blocks
    new Map(),  // slot placeholders
    pageContent,  // default content = page content
    ast.source
  );
  
  return {
    type: 'FeedAST',
    nodes: mergedNodes,
    source: ast.source,
  };
}

/**
 * Check if a node is a layout element (supports both <layout> and <feedjs-layout>)
 */
function isFeedLayout(node: FeedASTNode): boolean {
  if (node.type === 'Element') {
    return node.tag === 'layout' || node.tag === 'feedjs-layout';
  }
  return false;
}

/**
 * Check if an element has f:inherit attribute
 */
function hasInherit(node: FeedASTNode): boolean {
  if (node.type === 'Element') {
    return 'f:inherit' in node.attributes;
  }
  return false;
}

/**
 * Get f:inherit value from element
 */
function getInheritSrc(node: FeedASTNode): string | undefined {
  if (node.type === 'Element') {
    return node.attributes['f:inherit'] as string | undefined;
  }
  return undefined;
}

/**
 * Process f:inherit attributes in AST nodes
 * Replaces elements with f:inherit with content from the inherited file
 */
function processInherit(
  nodes: FeedASTNode[],
  resolveLayoutFile: (src: string) => string
): FeedASTNode[] {
  const result: FeedASTNode[] = [];
  
  for (const node of nodes) {
    if (node.type === 'Element' && hasInherit(node)) {
      const inheritSrc = getInheritSrc(node);
      if (inheritSrc) {
        try {
          const inheritContent = resolveLayoutFile(inheritSrc);
          const inheritAST = parseTemplate(inheritContent);
          
          // Get the first element from the inherited file
          const inheritElement = inheritAST.nodes.find(n => n.type === 'Element');
          if (inheritElement && inheritElement.type === 'Element') {
            const inheritedEl = inheritElement as FeedElementNode;
            
            // Merge: use inherited element's tag, but keep current element's props and children
            const mergedElement: FeedElementNode = {
              ...inheritedEl,
              attributes: { ...inheritedEl.attributes, ...node.attributes },
              // Remove f:inherit from final element
              directives: (node as FeedElementNode).directives?.filter(d => d.name !== 'f:inherit') || [],
              children: (node as FeedElementNode).children || inheritedEl.children,
            };
            
            result.push(mergedElement);
          }
        } catch (e) {
          throw new CompileError(
            `Failed to load inherited file: ${inheritSrc}`,
            node.type === 'Element' ? (node as any).source || '' : ''
          );
        }
      }
    } else if (node.type === 'Element' && node.children) {
      // Recursively process children
      const processedChildren = processInherit(node.children, resolveLayoutFile);
      result.push({
        ...node,
        children: processedChildren,
      } as FeedASTNode);
    } else {
      result.push(node);
    }
  }
  
  return result;
}

/**
 * Extract template blocks from children
 */
function extractTemplateBlocks(children: FeedASTNode[]): Map<string, FeedASTNode[]> {
  const templates = new Map<string, FeedASTNode[]>();
  
  for (const child of children) {
    if (child.type === 'TemplateBlock') {
      const templateNode = child as FeedTemplateBlockNode;
      if (templates.has(templateNode.name)) {
        throw new CompileError(
          `Duplicate template slot: ${templateNode.name}`,
          ''
        );
      }
      templates.set(templateNode.name, templateNode.children);
    }
  }
  
  return templates;
}

/**
 * Extract slot placeholders from children
 */
function extractSlotPlaceholders(children: FeedASTNode[]): Map<string, FeedASTNode[]> {
  const slots = new Map<string, FeedASTNode[]>();
  
  for (const child of children) {
    if (child.type === 'SlotPlaceholder') {
      const slotNode = child as FeedSlotPlaceholderNode;
      if (slots.has(slotNode.name)) {
        throw new CompileError(
          `Duplicate slot usage: ${slotNode.name}`,
          ''
        );
      }
      slots.set(slotNode.name, slotNode.children);
    }
  }
  
  return slots;
}

/**
 * Merge slots into layout AST
 */
function mergeSlots(
  layoutNodes: FeedASTNode[],
  templateBlocks: Map<string, FeedASTNode[]>,
  slotPlaceholders: Map<string, FeedASTNode[]>,
  defaultContent: FeedASTNode[],
  source: string
): FeedASTNode[] {
  const result: FeedASTNode[] = [];
  
  for (const node of layoutNodes) {
    if (node.type === 'Slot') {
      const slotNode = node as unknown as SlotNode;
      const slotName = slotNode.name || 'default';
      
      // Check for template block first
      if (templateBlocks.has(slotName)) {
        result.push(...templateBlocks.get(slotName)!);
      }
      // Then check for slot placeholders
      else if (slotPlaceholders.has(slotName)) {
        result.push(...slotPlaceholders.get(slotName)!);
      }
      // Check for fallback
      else if (slotNode.fallback && slotNode.fallback.length > 0) {
        result.push(...slotNode.fallback);
      }
      // No content provided - error for named slots
      else if (slotName !== 'default') {
        throw new CompileError(
          `Missing slot content for: ${slotName}`,
          source
        );
      }
      // Default slot - use page content
      else if (defaultContent.length > 0) {
        result.push(...defaultContent);
      }
    } else if (node.type === 'Element' && node.children) {
      const processedChildren = mergeSlots(
        node.children,
        templateBlocks,
        slotPlaceholders,
        defaultContent,
        source
      );
      
      result.push({
        ...node,
        children: processedChildren,
      } as FeedASTNode);
    } else {
      result.push(node);
    }
  }
  
  return result;
}

/**
 * Compile error class
 */
export class CompileError extends Error {
  constructor(message: string, public source: string) {
    super(message);
    this.name = 'CompileError';
  }
}
