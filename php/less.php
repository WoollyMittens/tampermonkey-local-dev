<?php

/*
  http://localhost/Tampermonkey/tampermonkey-local-dev/php/less.php?path=../less/local.less
*/

header("Content-type: text/css", true);

require "./lessphp/lessc.inc.php";

$options = array('sourceMap' => true);

$parser = new Less_Parser($options);

$parser->parseFile(@$_REQUEST['path']);

echo  str_replace("../less/", "../", $parser->getCss());

?>
