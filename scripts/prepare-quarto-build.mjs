import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const sources = [
  ["README.md", "index.qmd", "front"],
  ["Acknowledgments.md", "acknowledgments.qmd", "acknowledgments"],
  ["Abbreviations.md", "abbreviations.qmd", "abbreviations"],
  ["Introduction.md", "introduction.qmd", "introduction"],
  ["Chapter1.md", "chapter-01.qmd", "chapter-01"],
  ["Chapter2.md", "chapter-02.qmd", "chapter-02"],
  ["Chapter3.md", "chapter-03.qmd", "chapter-03"],
  ["Chapter4.md", "chapter-04.qmd", "chapter-04"],
  ["Chapter5.md", "chapter-05.qmd", "chapter-05"],
  ["Chapter6.md", "chapter-06.qmd", "chapter-06"],
  ["Chapter7.md", "chapter-07.qmd", "chapter-07"],
  ["Chapter8.md", "chapter-08.qmd", "chapter-08"],
  ["Chapter9.md", "chapter-09.qmd", "chapter-09"],
  ["Chapter10.md", "chapter-10.qmd", "chapter-10"],
  ["Conclusion.md", "conclusion.qmd", "conclusion"],
];

const outDir = ".quarto-build";

function mergeLeadingHeadings(text, unnumbered) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let index = 0;

  while (index < lines.length && lines[index].trim() === "") {
    index++;
  }

  const first = lines[index]?.match(/^#\s+(.+?)\s*$/);
  const second = lines[index + 1]?.match(/^#\s+(.+?)\s*$/);

  if (first && second) {
    const suffix = unnumbered ? " {.unnumbered}" : "";
    lines.splice(index, 2, `# ${first[1]} / ${second[1]}${suffix}`);
  }

  return lines.join("\n");
}

function prefixFootnotes(text, prefix) {
  return text.replace(/\[\^([^\]\s]+)\]/g, (_match, id) => `[^${prefix}-${id}]`);
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const [source, target, prefix] of sources) {
  const raw = await readFile(source, "utf8");
  const unnumbered = target === "index.qmd" || target === "acknowledgments.qmd" || target === "abbreviations.qmd";
  const prepared = prefixFootnotes(mergeLeadingHeadings(raw, unnumbered), prefix);
  await writeFile(path.join(outDir, target), `${prepared.trimEnd()}\n`);
}
