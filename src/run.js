import { readFile as readFileFromDisk } from 'node:fs/promises';
import { extractMermaidBlocks, isMarkdownFile, looksLikeMarkdown } from './input.js';
import { validateDiagrams } from './validate.js';

const usage = 'Usage: mermaid-validate [FILE]';

async function readStdin(stdin) {
  let input = '';
  stdin.setEncoding('utf8');
  for await (const chunk of stdin) input += chunk;
  return input;
}

function parseArguments(args, stdout) {
  if (args.includes('--help') || args.includes('-h')) {
    stdout.write(`${usage}\n\nValidate a Mermaid file, Markdown file, or stdin.\n`);
    return null;
  }

  if (args.length > 1 || args.some((arg) => arg.startsWith('-'))) {
    throw new Error(usage);
  }

  return args[0];
}

export async function run(args, io, readFile = readFileFromDisk) {
  let filename;
  try {
    filename = parseArguments(args, io.stdout);
  } catch (error) {
    io.stderr.write(`${error.message}\n`);
    return 2;
  }

  if (filename === null) return 0;

  let source;
  try {
    source = filename ? await readFile(filename, 'utf8') : await readStdin(io.stdin);
  } catch (error) {
    io.stderr.write(`${filename}: ${error.message}\n`);
    return 2;
  }

  const markdown = filename ? isMarkdownFile(filename) : looksLikeMarkdown(source);
  let diagrams;
  try {
    diagrams = markdown
      ? extractMermaidBlocks(source)
      : [{ source, line: 1 }];
  } catch (error) {
    io.stderr.write(`${filename ?? 'stdin'}: ${error.message}\n`);
    return 1;
  }

  const label = filename ?? 'stdin';
  const failures = await validateDiagrams(diagrams);
  if (failures.length > 0) {
    for (const failure of failures) {
      io.stderr.write(`${label}:${failure.line}: ${failure.message}\n`);
    }
    return 1;
  }

  const noun = diagrams.length === 1 ? 'diagram' : 'diagrams';
  io.stdout.write(`${label}: ${diagrams.length} ${noun} valid\n`);
  return 0;
}
