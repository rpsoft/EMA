<?php  
    error_reporting(0);
    $user = $_GET['user'];
    $pass = $_GET['pass'];
    
    $address = str_replace("/php/getAnnotator.php","/restricted/js/Annotator.js",$_SERVER[ 'PHP_SELF']);
    
    $file = file_get_contents('http://'.$user.':'.$pass.'@'.$_SERVER[ 'HTTP_HOST'].$address);
    echo $file;


    
    ?>