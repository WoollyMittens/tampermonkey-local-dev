<?php

/*
  http://localhost/~mauricevancreij/Tampermonkey/tampermonkey-local-dev/php/less2css.php?path=../../../Tampermonkey/tampermonkey-local-dev/less/styles.less
*/

header("Content-type: text/css", true);

require "./lessphp/lessc.inc.php";

$less = new lessc;

$less->setFormatter("lessjs");

echo $less->compileFile(@$_REQUEST['path']);

?>
