<?php

/*
  http://localhost/~mauricevancreij/Tampermonkey/tampermonkey-local-dev/php/scss2css.php?path=../../../Tampermonkey/tampermonkey-local-dev/scss/styles.scss
*/

header("Content-type: text/css", true);

require_once './scssphp/scss.inc.php';

use ScssPhp\ScssPhp\Compiler;

$scss = new Compiler();

$scss->setFormatter("ScssPhp\ScssPhp\Formatter\Expanded");

$scss->setLineNumberStyle(Compiler::LINE_COMMENTS);

echo $scss->compile('@import "' . @$_REQUEST['path'] . '";');

?>
