<?php

header("Content-type: text/css", true);

echo file_get_contents(@$_REQUEST['path']);

?>
