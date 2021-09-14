import { makeRegex } from './common.mjs';
import jgrep from './jgrep.mjs';

//Immediately Invoked Function Expression (IIFE)
//hides all definitions from outside IIFE
(function() {
  
  function setup() {
    const ids = [ 'regex', 'url', 'content' ];
    const widgets =
      Object.fromEntries(ids.map(id => [id, document.getElementById(id) ]));
    widgets.url.addEventListener('change',
				 ev => loadContent(ev.target.value, widgets));
    widgets.content.addEventListener('input', () => change(widgets)); 
    widgets.regex.addEventListener('change', () => change(widgets));
  }

  window.onload = setup;

  async function loadContent(url, widgets) {
    try {
      clearErrors();
      const response = await fetch(url);
      if (response.status !== 200) {
	error('url', `accessing ${url} resulted in ${response.status}`);
	return;
      }
      const data = await response.text();
      widgets.content.innerHTML = data;
    }
    catch (err) {
      error('url', err.message);
    }
  }

  function change(widgets) {
    clearErrors();
    const regex = makeRegex(widgets.regex.value);
    if (regex === null) {
      error('regex', `bad regex ${widgets.regex.value}`);
      return;
    }
    const content = widgets.content.innerText;
    const results = jgrep(regex, content);
    reportResults(results, widgets.content);
  }

  function reportResults(results, widget) {
    let lines = widget.innerText.split(/\n/);
    for (const result of results) {
      const { lineIndex, colIndex, matchLen } = result;
      const line = lines[lineIndex];
      const newLine =
        '<span class="matchLine">' +
        line.slice(0, colIndex) +
        '<span class="matchContent">' +
        line.slice(colIndex, colIndex + matchLen) +
        '</span>' +
        line.slice(colIndex + matchLen) +
        '</span>';
      lines[lineIndex] = newLine;
    }
    widget.innerHTML = lines.join('\n');
  }
  
					     
  function error(id, msg) {
    const errWidget = document.querySelectorAll(`#${id} ~ .error`)[0];
    errWidget.innerHTML = msg;
  }

  function clearErrors() {
    document.querySelectorAll('.error').forEach(e => e.innerHTML = '');
  }
  
})();
