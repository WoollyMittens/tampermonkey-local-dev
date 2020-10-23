// ==UserScript==
// @name         PROJECT_NAME
// @namespace    http://tampermonkey.net/
// @version      0.7.4
// @description  Insert custom CSS and JS
// @author       maurice.vancreij@webqem.com
// @match        https://*.PROJECT_WEBSITE.com/*
// @grant        none
// ==/UserScript==

(function() {

  'use strict';

  // CONDITIONS

  if (/admin/.test(document.location.href)){ return false; }
  else { window.tampered = true; }

  // PROPERTIES

  const localUrl = 'http://localhost/PATH_TO_THIS_FOLDER/';
  const removeThese = 'link[href*="existing.css"]';
  const styleIncludes = [
    'less/local.less'
  ];
  const scriptIncludes = [
    'js/local.js'
  ];
  const htmlIncludes = [{
    'url': 'html/local.html',
    'container': '#container'
  }];
  const webfontIncludes = [
    'https://use.typekit.net/TYPEKIT_FONTS.css',
    'https://fonts.googleapis.com/css?family=GOOGLE_FONTS',
    'https://kit.fontawesome.com/ICON_FONT.js'
  ];
  const compileBefore = true;
  const compileAfter = (!compileBefore && /.less/.test(styleIncludes.join(',')));

  // METHODS

  function removeAssets() {
    // stop if there's nothing to remove
    if (!removeThese) return null;
    // remove all matched assets
    var oldAssets = document.querySelectorAll(removeThese);
    for (var a = 0, b = oldAssets.length; a < b; a += 1) {
      oldAssets[a].parentNode.removeChild(oldAssets[a]);
    }
  };

  function compileLess() {
    // insert on the fly Less compilation
    var Less = document.createElement('script');
    Less.setAttribute('type', 'text/javascript');
    Less.setAttribute('src', '//cdnjs.cloudflare.com/ajax/libs/less.js/3.9.0/less.min.js');
    document.getElementsByTagName('head')[0].appendChild(Less);
  };

  function createStyle(path) {
    var href = (compileBefore ? localUrl + 'php/{type}.php?path=../{path}&t={t}' : localUrl + '{path}?t={t}')
      .replace('{type}', path.split('.').pop())
      .replace('{path}', path)
      .replace('{t}', new Date().getTime());
    // generate a replacement stylesheet
    var link = document.createElement('link');
    link.setAttribute('rel', (compileAfter) ? 'stylesheet/less' : 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', href);
    // return a reference
    return link;
  };

  function createScript(path) {
    var src = (compileBefore ? localUrl + 'php/{type}.php?path=../{path}&t={t}' : localUrl + '{path}?t={t}')
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
      // find a possible existing one
      existing = document.querySelector('link[href*="' + href + '"]');
      // replace or insert the include
      if (existing) { existing.parentNode.replaceChild(style, existing) }
      else { document.getElementsByTagName('head')[0].appendChild(style) };
    }
    // if any of the files where LESS
    if (compileAfter) compileLess();
  };

  function resetScripts() {
    var src, script;
    // for all stylesheets
    for (var a = 0, b = scriptIncludes.length; a < b; a += 1) {
      src = scriptIncludes[a];
      // create the new include
      script = createScript(src);
      // insert the include
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  };

  function resetHtml() {
    var htmlRequest;
    var htmlContainer;
    var htmlResolve = function(container, evt) {
      // process the html
      var importedHTML = evt.target.responseText;
      importedHTML = importedHTML.split(/<!-- CUT FROM HERE -->|<!-- CUT TO HERE -->|<!-- CUT HERE -->/);
      importedHTML = (importedHTML.length > 1) ? importedHTML[1] : importedHTML[0];
      importedHTML = importedHTML.replace(/\.\.\//g, localUrl)
      // insert it into the page
      container.innerHTML = importedHTML;
    };
    // for all html includes
    for (var a = 0, b = htmlIncludes.length; a < b; a += 1) {
      // fetch the component
      htmlContainer = document.querySelector(htmlIncludes[a].container);
      if (htmlContainer) {
        htmlRequest = new XMLHttpRequest();
        htmlRequest.addEventListener("load", htmlResolve.bind(this, htmlContainer));
        htmlRequest.open("GET", localUrl + htmlIncludes[a].url + '?t=' + new Date().getTime());
        htmlRequest.send();
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
      if (compileAfter) { document.location.reload(); return null; }
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
