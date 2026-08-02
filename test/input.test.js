import test from 'node:test';
import assert from 'node:assert/strict';
import { extractMermaidBlocks, isMarkdownFile, looksLikeMarkdown } from '../src/input.js';

test('recognizes Markdown filenames', () => {
  assert.equal(isMarkdownFile('README.md'), true);
  assert.equal(isMarkdownFile('diagram.mmd'), false);
});

test('detects Mermaid fences in stdin', () => {
  assert.equal(looksLikeMarkdown('```mermaid\ngraph TD\n```'), true);
  assert.equal(looksLikeMarkdown('graph TD\n  A --> B'), false);
});

test('extracts only Mermaid blocks and records their content line', () => {
  const source = [
    '# Diagrams',
    '',
    '```js',
    'const ignored = true;',
    '```',
    '',
    '~~~mermaid',
    'flowchart LR',
    '  A --> B',
    '~~~',
  ].join('\n');

  assert.deepEqual(extractMermaidBlocks(source), [
    { source: 'flowchart LR\n  A --> B', line: 8 },
  ]);
});

test('rejects an unclosed Mermaid fence', () => {
  assert.throws(
    () => extractMermaidBlocks('text\n```mermaid\ngraph TD'),
    /Unclosed Mermaid code fence at line 2/,
  );
});
