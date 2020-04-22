<?php

header("Content-type: text/javascript", true);

echo file_get_contents(@$_REQUEST['path']);

?>
