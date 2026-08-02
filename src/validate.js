import { JSDOM } from 'jsdom';

// Mermaid sanitizes labels while parsing. DOMPurify binds to `window` when
// Mermaid is imported, so the DOM must exist before that dynamic import.
globalThis.window = new JSDOM('').window;
const { default: mermaid } = await import('mermaid');

export async function validateDiagrams(diagrams) {
  const failures = [];

  for (const diagram of diagrams) {
    try {
      await mermaid.parse(diagram.source);
    } catch (error) {
      failures.push({
        ...diagram,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return failures;
}
