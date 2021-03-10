<?php

/*
  http://localhost/Tampermonkey/tampermonkey-local-dev/php/scss.php?path=../scss/local.scss
*/

header("Content-type: text/css", true);

require_once './scssphp/scss.inc.php';

use ScssPhp\ScssPhp\Compiler;

$scss = new Compiler();

$scss->setFormatter("ScssPhp\ScssPhp\Formatter\Expanded");

$scss->setSourceMap(Compiler::SOURCE_MAP_INLINE);

$scss->setLineNumberStyle(Compiler::LINE_COMMENTS);

echo $scss->compile('@import "' . @$_REQUEST['path'] . '";');

?>
