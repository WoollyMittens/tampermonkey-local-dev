/*
  Addition scripts
*/

function myComponent($, override) {

  // CONDITIONS

  "use strict";

  if(/noscript=1/.test(document.location.href) && !override) return false;

  // PROPERTIES

  // CLASSES

  // METHODS

  // EVENTS

}

if (window.tm_develop){ myComponent(jQuery, true); }
else { define(["jquery"], myComponent); }
