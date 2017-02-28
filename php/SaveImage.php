<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$data = $_POST['img'];

list($type, $data) = explode(';', $data);
list(, $data)      = explode(',', $data);
$data = base64_decode($data);

file_put_contents("../images/".$_POST['uniqueId'].'.png', $data);


echo $data;