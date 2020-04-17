// ==UserScript==
// @name         PROJECT_NAME
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Insert custom CSS and JS
// @author       maurice.vancreij@webqem.com
// @match        https://*.PROJECT_WEBSITE.com/*
// @grant        none
// ==/UserScript==

(function() {

  'use strict';

  const localUrl = 'http://localhost/PATH_TO_THE_LOCAL_FILES/';
  const stylesHref = 'css/styles.less';
  const scriptSrc = 'js/scripts.js';
  const removeThese = 'link[href*="existing.css"]';

  function removeStyles() {
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

  function createStyles() {
    // generate a replacement stylesheet
    var link = document.createElement('link');
    link.setAttribute('rel', (/.less/.test(stylesHref)) ? 'stylesheet/less' : 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', localUrl + stylesHref + '?t=' + new Date().getTime());
    // return a reference
    return link;
  };

  function createScripts() {
    // generate a replacement script block
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', localUrl + scriptSrc + '?t=' + new Date().getTime());
    // return a reference
    return script;
  };

  function resetIncludes() {
    // replace the stylesheet
    var stylesReplacement = createStyles();
    stylesInclude.parentNode.replaceChild(stylesReplacement, stylesInclude);
    stylesInclude = stylesReplacement;
    // compile Less if nessecary
    if (/.less/.test(stylesHref)) compileLess();
    // optionally replace the script
    if (!scriptSrc) return null;
    var scriptReplacement = createScripts();
    scriptInclude.parentNode.replaceChild(scriptReplacement, scriptInclude);
    scriptInclude = scriptReplacement;
  };

  // define starting value of existing includes, or insert new ones
  var stylesInclude = document.querySelector('link[href*="' + stylesHref + '"]') || document.getElementsByTagName('head')[0].appendChild(createStyles());
  var scriptInclude = document.querySelector('script[src*="' + scriptSrc + '"]') || document.getElementsByTagName('head')[0].appendChild(createScripts());

  // start the process

  if (removeThese) removeStyles();

  resetIncludes();

  window.addEventListener('keyup', function(evt) {
    if (evt.key === '`') {
      // reload the page in case of less compilation
      if (/.less/.test(stylesHref)) document.location.reload();
      // re-apply the includes
      resetIncludes();
    }
  });

})();
