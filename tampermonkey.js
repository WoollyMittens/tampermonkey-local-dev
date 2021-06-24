// ==UserScript==
// @name         PROJECT_NAME
// @namespace    http://tampermonkey.net/
// @version      0.7.7
// @description  Insert custom CSS, JS, and HTML
// @author       maurice.vancreij@webqem.com
// @match        https://*.PROJECT_WEBSITE.com/*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// ==/UserScript==

(function() {

  'use strict';

  // CONDITIONS

  if (/admin/.test(document.location.href)){ return false; }
  else { window.tampered = true; }

  // PROPERTIES

  const localUrl = 'http://localhost/PATH_TO_THIS_FOLDER/';
  const remotePath = /\.\.\//gi;
  const scriptIncludes = ['js/local.js -> body'];
  const styleIncludes = ['less/local.less -> screen'];
  const htmlIncludes = ['html/local.html -> #container'];
  const htmlRemovals = ['#source .elements -> #destination'];
  const webfontIncludes = [
    'https://use.typekit.net/TYPEKIT_FONTS.css',
    'https://fonts.googleapis.com/css?family=GOOGLE_FONTS',
    'https://kit.fontawesome.com/ICON_FONT.js'
  ];
  const compileFirst = true;
  const compileLast = (!compileFirst && /.less/.test(styleIncludes.join(',')));
  const useGmApi = (typeof GM_xmlhttpRequest !== 'undefined');

  // METHODS

  function removeAssets() {
    // for all removals
    htmlRemovals.map(function(rule) {
      // parse the rule
      var parts = rule.split(' -> ');
      var sources = Array.prototype.slice.call(document.querySelectorAll(parts[0]));
      var destination = (parts.length > 1) ? document.querySelector(parts[1]) : null;
      console.log(sources);
      // (re)move the source to the destination
      sources.map(function(source) {
        var element = (destination) ?
          destination.appendChild(source):
          source.parentNode.removeChild(source);
      });
    });
  };

  function compileLess() {
    // insert on the fly Less compilation
    var Less = document.createElement('script');
    Less.setAttribute('type', 'text/javascript');
    Less.setAttribute('src', '//cdnjs.cloudflare.com/ajax/libs/less.js/3.9.0/less.min.js');
    document.getElementsByTagName('head')[0].appendChild(Less);
  };

  function createStyle(include) {
    // seperate any conditions
    include = include.split(' -> ');
    var path = include[0];
    var media = (include.length === 1) ? '' : include.pop();
    // generate the path
    var href = (compileFirst ? localUrl + 'php/{type}.php?path=../{path}&t={t}' : localUrl + '{path}?t={t}')
      .replace('{type}', path.split('.').pop())
      .replace('{path}', path)
      .replace('{t}', new Date().getTime());
    // generate a replacement stylesheet
    var link = (useGmApi) ? document.createElement('style') : document.createElement('link');
    link.setAttribute('media', media);
    // fill the replacement stylesheet
    if (useGmApi) {
      GM_xmlhttpRequest({
        method: 'GET',
        url: href + '?t=' + new Date().getTime(),
        onload: function(evt) {
          if (evt.status !== 200) { console.log('error retrieving css:', evt); return null; };
          var css = evt.responseText || evt.target.responseText;
          link.innerHTML = css.replace(remotePath, localUrl);
        }
      });
      link.setAttribute('data-href', href);
    } else {
      link.setAttribute('rel', (compileLast) ? 'stylesheet/less' : 'stylesheet');
      link.setAttribute('type', 'text/css');
      link.setAttribute('href', href);
    }
    // return a reference
    return link;
  };

  function createScript(path) {
    var src = (compileFirst ? localUrl + 'php/{type}.php?path=../{path}&t={t}' : localUrl + '{path}?t={t}')
      .replace('{type}', path.split('.').pop())
      .replace('{path}', path)
      .replace('{t}', new Date().getTime());
    // generate a replacement script block
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', src);
    // return a reference
    return script;
  };

  function resetStyles() {
    var href, style, existing;
    // for all stylesheets
    for (var a = 0, b = styleIncludes.length; a < b; a += 1) {
      href = styleIncludes[a];
      // create the new include
      style = createStyle(href);
      href= href.split(' ')[0];
      // find a possible existing one
      existing = document.querySelector('link[href*="' + href + '"],style[data-href*="' + href + '"]');
      // replace or insert the include
      if (existing) { existing.parentNode.replaceChild(style, existing) }
      else { document.getElementsByTagName('head')[0].appendChild(style) };
    }
    // if any of the files where LESS
    if (compileLast) compileLess();
  };

  function resetScripts() {
    var src, script, destination;
    // for all stylesheets
    for (var a = 0, b = scriptIncludes.length; a < b; a += 1) {
      src = scriptIncludes[a].split(' -> ');
      // locate the destination
      destination = (src.length === 1) ? 'head' : src.pop();
      // create the new include
      script = createScript(src[0]);
      // insert the include
      document.querySelector(destination).appendChild(script);
    }
  };

  function resetHtml() {
    var htmlPath;
    var htmlRequest;
    var htmlContainer;
    var htmlResolve = function(container, evt) {
      if (evt.status !== 200) { console.log('error retrieving html:', evt); return null; };
      // process the html
      var importedHTML = evt.responseText || evt.target.responseText;
      importedHTML = importedHTML.split(/<!-- CUT FROM HERE -->|<!-- CUT TO HERE -->|<!-- CUT HERE -->/);
      importedHTML = (importedHTML.length > 1) ? importedHTML[1] : importedHTML[0];
      importedHTML = importedHTML.replace(remotePath, localUrl);
      // insert it into the page
      container.innerHTML = importedHTML;
    };
    // for all html includes
    for (var a = 0, b = htmlIncludes.length; a < b; a += 1) {
      // fetch the component
      htmlPath = htmlIncludes[a].split(' -> ');
      htmlContainer = document.querySelector(htmlPath[1]);
      if (htmlContainer) {
        if (useGmApi) {
          GM_xmlhttpRequest({
            method: 'GET',
            url: localUrl + htmlPath[0] + '?t=' + new Date().getTime(),
            onload: htmlResolve.bind(this, htmlContainer)
          });
        } else {
          htmlRequest = new XMLHttpRequest();
          htmlRequest.addEventListener("load", htmlResolve.bind(this, htmlContainer));
          htmlRequest.open("GET", localUrl + htmlPath[0] + '?t=' + new Date().getTime());
          htmlRequest.send();
        }
      }
    }
  };

  function resetFonts() {
    var include;
    // for all webfonts
    for (var a = 0, b = webfontIncludes.length; a < b; a += 1) {
      // generate a js or a css include
      if (/.js/.test(webfontIncludes[a])) {
        include = document.createElement('script');
        include.setAttribute('type', 'text/javascript');
        include.setAttribute('crossorigin', 'anonymous');
        include.setAttribute('src', webfontIncludes[a]);
      }
      else {
        include = document.createElement('link');
        include.setAttribute('rel', 'stylesheet');
        include.setAttribute('type', 'text/css');
        include.setAttribute('href', webfontIncludes[a]);
      }
      // insert in the header
      document.getElementsByTagName('head')[0].appendChild(include);
    }
  };

  function runTests() {
    // custom tests
  };

  // EVENTS

  window.addEventListener('keyup', function(evt) {
    if (evt.key === '`') {
      // reload the page if on the fly less compilation was used
      if (compileLast) { document.location.reload(); return null; }
      // re-apply the includes
      resetStyles();
      resetScripts();
      resetHtml();
    }
  });

  removeAssets();
  resetStyles();
  resetScripts();
  resetHtml();
  resetFonts();
  runTests();

})();
