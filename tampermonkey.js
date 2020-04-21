// ==UserScript==
// @name         PROJECT_NAME
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Insert custom CSS and JS
// @author       maurice.vancreij@webqem.com
// @match        https://*.PROJECT_WEBSITE.com/*
// @grant        none
// ==/UserScript==

(function() {

  'use strict';

  // PROPERTIES

  const localUrl = 'http://localhost/PATH_TO_THE_LOCAL_FILES/';
  const styleUrls = ['css/styles.less'];
  const scriptUrls = ['js/scripts.js'];
  const removeThese = 'link[href*="existing.css"]';

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

  function createStyle(href) {
    // generate a replacement stylesheet
    var link = document.createElement('link');
    link.setAttribute('rel', (/.less/.test(href)) ? 'stylesheet/less' : 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', localUrl + href + '?t=' + new Date().getTime());
    // return a reference
    return link;
  };

  function createScript(src) {
    // generate a replacement script block
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', localUrl + src + '?t=' + new Date().getTime());
    // return a reference
    return script;
  };

  function resetStyles() {
    var href, style, existing;
    // for all stylesheets
    for (var a = 0, b = styleUrls.length; a < b; a += 1) {
      href = styleUrls[a];
      // create the new include
      style = createStyle(href);
      // find a possible existing one
      existing = document.querySelector('link[href*="' + href + '"]');
      // replace or insert the include
      if (existing) { existing.parentNode.replaceChild(style, existing) }
      else { document.getElementsByTagName('head')[0].appendChild(style) };
    }
    // compile any less includes
    if (/.less/.test(styleUrls.join(','))) compileLess();
  };

  function resetScripts() {
    var src, script;
    // for all stylesheets
    for (var a = 0, b = scriptUrls.length; a < b; a += 1) {
      src = scriptUrls[a];
      // create the new include
      script = createScript(src);
      // insert the include
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  };

  // EVENTS

  window.addEventListener('keyup', function(evt) {
    if (evt.key === '`') {
      // reload the page in case of less compilation
      if (/.less/.test(styleUrls)) document.location.reload();
      // re-apply the includes
      resetStyles();
      resetScripts();
    }
  });

  removeAssets();
  resetStyles();
  resetScripts();

})();
