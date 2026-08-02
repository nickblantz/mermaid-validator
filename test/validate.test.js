import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDiagrams } from '../src/validate.js';

test('accepts valid Mermaid syntax', async () => {
  const failures = await validateDiagrams([
    { source: 'flowchart LR\n  A --> B', line: 1 },
  ]);
  assert.deepEqual(failures, []);
});

test('accepts flowchart labels that require DOMPurify', async () => {
  const failures = await validateDiagrams([
    {
      source: 'flowchart TB\n  pc[Personal\\nComputer]',
      line: 1,
    },
  ]);
  assert.deepEqual(failures, []);
});

test('reports invalid Mermaid syntax', async () => {
  const failures = await validateDiagrams([
    { source: 'flowchart LR\n  A -- B', line: 4 },
  ]);
  assert.equal(failures.length, 1);
  assert.equal(failures[0].line, 4);
  assert.match(failures[0].message, /Parse error/);
});
