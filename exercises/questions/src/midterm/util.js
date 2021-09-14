function ol(items, liIndent) {
  const lineIndent = line => (line.match(/\s+/)?.[0] ?? '').length;
  const li = (item => {
    const lineIndents = item.
      replace(/^\s*\n/, ''). //remove initial empty lines
      split('\n').
      map(line => ({line, indent: lineIndent(line)}));
    const indent0 = lineIndents[0].indent;
    return lineIndents.
      map(({line, indent}) => {
	const space = ' '.repeat(indent - indent0 + liIndent);
	return line.replace(/^\s*/, space);
      }).
      join('\n').
      replace(/  (\S)/, '# $1');
  });
  return '\n' + items.map(item => li(item)).join('\n\n') + '\n';
}

module.exports = { ol, };
