import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import * as t from '@babel/types';

// Handle both ESM and CJS imports
const traverse = (traverseModule as any).default || traverseModule;
type NodePath<T = any> = typeof traverseModule extends { NodePath: infer N } ? N : any;
import { readFile } from 'fs/promises';
import { relative } from 'path';

export interface ExtractedMessage {
  key: string;
  text: string;
  location: {
    file: string;
    line: number;
    column: number;
  };
  context?: string;
  explicitKey?: boolean;
}

export async function parseFile(
  filePath: string,
  projectRoot: string
): Promise<ExtractedMessage[]> {
  const content = await readFile(filePath, 'utf-8');
  const relativePath = relative(projectRoot, filePath);

  const ast = parse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  const messages: ExtractedMessage[] = [];

  traverse(ast, {
    // Find <Trans> components
    JSXElement(path: NodePath<t.JSXElement>) {
      const openingElement = path.node.openingElement;

      // Check if it's a <Trans> component
      const isTransComponent =
        (t.isJSXIdentifier(openingElement.name) && openingElement.name.name === 'Trans');

      if (!isTransComponent) return;

      // Extract text content
      const textContent = extractJSXText(path.node);
      if (!textContent) return;

      messages.push({
        key: textContent, // Use the actual text as the key
        text: textContent,
        location: {
          file: relativePath,
          line: path.node.loc?.start.line || 0,
          column: path.node.loc?.start.column || 0,
        },
      });
    },

    // Find tagged template literals: t`Hello`
    TaggedTemplateExpression(path: NodePath<t.TaggedTemplateExpression>) {
      if (
        !t.isIdentifier(path.node.tag) ||
        path.node.tag.name !== 't'
      ) {
        return;
      }

      const quasi = path.node.quasi;
      if (quasi.quasis.length !== 1) {
        // Has expressions - extract with placeholders
        const text = extractTemplateWithPlaceholders(quasi);
        messages.push({
          key: text, // Use the actual text as the key
          text,
          location: {
            file: relativePath,
            line: path.node.loc?.start.line || 0,
            column: path.node.loc?.start.column || 0,
          },
        });
      } else {
        // Simple string
        const text = quasi.quasis[0].value.cooked || quasi.quasis[0].value.raw;
        messages.push({
          key: text, // Use the actual text as the key
          text,
          location: {
            file: relativePath,
            line: path.node.loc?.start.line || 0,
            column: path.node.loc?.start.column || 0,
          },
        });
      }
    },

    // Find regular function calls: t('Hello') or t('Hello', {name: 'World'})
    CallExpression(path: NodePath<t.CallExpression>) {
      // Check if it's a call to 't' function
      if (!t.isIdentifier(path.node.callee) || path.node.callee.name !== 't') {
        return;
      }

      // Must have at least one argument (the text)
      if (path.node.arguments.length === 0) {
        return;
      }

      const firstArg = path.node.arguments[0];

      // Only extract string literals
      if (t.isStringLiteral(firstArg)) {
        messages.push({
          key: firstArg.value, // Use the actual text as the key
          text: firstArg.value,
          location: {
            file: relativePath,
            line: path.node.loc?.start.line || 0,
            column: path.node.loc?.start.column || 0,
          },
        });
      }
    },
  });

  return messages;
}

function extractJSXText(node: t.JSXElement): string | null {
  const textParts: string[] = [];

  for (const child of node.children) {
    if (t.isJSXText(child)) {
      const text = child.value.trim();
      if (text) textParts.push(text);
    } else if (t.isJSXExpressionContainer(child)) {
      const expr = child.expression;
      if (t.isIdentifier(expr)) {
        // ICU placeholder
        textParts.push(`{${expr.name}}`);
      } else if (t.isJSXEmptyExpression(expr)) {
        // Skip empty expressions
        continue;
      } else {
        // Complex expression - not supported in MVP
        return null;
      }
    } else {
      // Nested JSX element - not supported in MVP
      return null;
    }
  }

  return textParts.length > 0 ? textParts.join(' ') : null;
}

function extractTemplateWithPlaceholders(quasi: t.TemplateLiteral): string {
  const parts: string[] = [];

  for (let i = 0; i < quasi.quasis.length; i++) {
    parts.push(quasi.quasis[i].value.cooked || quasi.quasis[i].value.raw);

    if (i < quasi.expressions.length) {
      const expr = quasi.expressions[i];
      if (t.isIdentifier(expr)) {
        parts.push(`{${expr.name}}`);
      } else {
        parts.push(`{${i}}`); // Fallback placeholder
      }
    }
  }

  return parts.join('');
}

export function generateKey(filePath: string, text: string): string {
  // Generate namespace from file path
  const namespace = filePath
    .replace(/\.(tsx?|jsx?)$/, '')
    .replace(/\//g, '.')
    .replace(/^src\./, '');

  // Generate short hash from text
  const hash = simpleHash(text).toString(36).substring(0, 6);

  return `${namespace}.${hash}`;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}