import path from 'node:path';

const markdownExtensions = new Set(['.md', '.markdown', '.mdown', '.mkd']);

export function isMarkdownFile(filename) {
  return markdownExtensions.has(path.extname(filename).toLowerCase());
}

export function looksLikeMarkdown(source) {
  return /^ {0,3}(`{3,}|~{3,})\s*mermaid(?:\s|$)/im.test(source);
}

export function extractMermaidBlocks(source) {
  const lines = source.split(/\r?\n/);
  const blocks = [];
  let fence = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (fence) {
      const closing = line.match(/^ {0,3}(`+|~+)\s*$/);
      if (
        closing &&
        closing[1][0] === fence.marker &&
        closing[1].length >= fence.length
      ) {
        if (fence.isMermaid) {
          blocks.push({
            source: fence.lines.join('\n'),
            line: fence.openingLine + 1,
          });
        }
        fence = null;
      } else if (fence.isMermaid) {
        fence.lines.push(line);
      }
      continue;
    }

    const opening = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!opening) continue;

    const language = opening[2].trim().split(/\s+/, 1)[0].toLowerCase();
    fence = {
      marker: opening[1][0],
      length: opening[1].length,
      isMermaid: language === 'mermaid',
      openingLine: index + 1,
      lines: [],
    };
  }

  if (fence?.isMermaid) {
    throw new Error(`Unclosed Mermaid code fence at line ${fence.openingLine}`);
  }

  return blocks;
}
