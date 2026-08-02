import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { run } from '../src/run.js';

function output() {
  return {
    value: '',
    write(chunk) {
      this.value += chunk;
    },
  };
}

async function invoke(args = [], input = '') {
  const stdout = output();
  const stderr = output();
  const status = await run(args, {
    stdin: Readable.from([input]),
    stdout,
    stderr,
  });
  return { status, stdout: stdout.value, stderr: stderr.value };
}

test('validates a Mermaid diagram from stdin', async () => {
  const result = await invoke([], 'flowchart LR\n  A[label] --> B[other]\n');

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  assert.equal(result.stdout, 'stdin: 1 diagram valid\n');
});

test('validates Mermaid fences from Markdown on stdin', async () => {
  const result = await invoke(
    [],
    '# Diagram\n\n```mermaid\nsequenceDiagram\n  A->>B: Hi\n```\n',
  );

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  assert.equal(result.stdout, 'stdin: 1 diagram valid\n');
});

test('returns status 1 for invalid Mermaid syntax', async () => {
  const result = await invoke([], 'flowchart LR\n  A -- B\n');

  assert.equal(result.status, 1);
  assert.match(result.stderr, /^stdin:1: Parse error/);
});

test('returns status 2 for invalid usage', async () => {
  const result = await invoke(['one.mmd', 'two.mmd']);

  assert.equal(result.status, 2);
  assert.equal(result.stderr, 'Usage: mermaid-validate [FILE]\n');
});
