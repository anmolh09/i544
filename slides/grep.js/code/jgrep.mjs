export default function jgrep(regex, content) {
  const results = [];
  const lines = content.split('\n');
  for (const [lineIndex, line] of lines.entries()) {
    const m = line.match(regex);
    if (m) {
      results.push(new Result(lineIndex, m.index, m[0].length));
    }
  }
  return results;
}

class Result {
  constructor(lineIndex, colIndex, matchLen) { 
    Object.assign(this, { lineIndex, colIndex, matchLen });
    Object.freeze(this);
  }
}
