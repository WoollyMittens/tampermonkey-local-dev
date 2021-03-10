<?php

/*
  http://localhost/Tampermonkey/tampermonkey-local-dev/php/less.php?path=../less/local.less
*/

header("Content-type: text/css", true);

require "./lessphp/lessc.inc.php";

$less = new lessc;

$less->setFormatter("lessjs");

echo $less->compileFile(@$_REQUEST['path']);

?>
