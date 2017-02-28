<?php
    error_reporting(E_ALL);
     ini_set('display_errors', 1);
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$files1 = scandir("../images");
echo json_encode(array_slice($files1, 2, count($files1)));
?>