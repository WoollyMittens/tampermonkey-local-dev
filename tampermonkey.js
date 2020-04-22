// ==UserScript==
// @name         PROJECT_NAME
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Insert custom CSS and JS
// @author       maurice.vancreij@webqem.com
// @match        https://*.PROJECT_WEBSITE.com/*
// @grant        none
// ==/UserScript==

(function() {

  'use strict';

  // PROPERTIES

  const localUrl = 'http://localhost/PATH_TO_THIS_FOLDER/';
  const removeThese = 'link[href*="existing.css"]';
  const styleIncludes = ['less/styles.less'];
  const scriptIncludes = ['js/scripts.js'];
  const compileFirst = true;

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

  function createStyle(path) {
    var href = (compileFirst ? localUrl + 'php/{type}.php?path=../{path}&t={t}' : localUrl + '{path}?t={t}')
      .replace('{type}', path.split('.').pop())
      .replace('{path}', path)
      .replace('{t}', new Date().getTime());
    // generate a replacement stylesheet
    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', href);
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
      // find a possible existing one
      existing = document.querySelector('link[href*="' + href + '"]');
      // replace or insert the include
      if (existing) { existing.parentNode.replaceChild(style, existing) }
      else { document.getElementsByTagName('head')[0].appendChild(style) };
    }
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

  // EVENTS

  window.addEventListener('keyup', function(evt) {
    if (evt.key === '`') {
      // re-apply the includes
      resetStyles();
      resetScripts();
    }
  });

  removeAssets();
  resetStyles();
  resetScripts();

})();
