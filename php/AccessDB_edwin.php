<?php
    error_reporting(E_ALL);
     ini_set('display_errors', 1);
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
* Define PostgreSQL database server connect parameters.
*/
define('PGHOST','localhost');
define('PGPORT',5432);
define('PGDATABASE','');
define('PGUSER', '');
define('PGPASSWORD', '');
define('PGCLIENTENCODING','UTF8');
define('ERROR_ON_CONNECT_FAILED','Sorry, can not connect the database server now!');

/*
* Merge connect string and connect db server with default parameters.
*/
$link  = pg_pconnect('host=' . PGHOST . ' port=' . PGPORT . ' dbname=' . PGDATABASE . ' user=' . PGUSER . ' password=' . PGPASSWORD);

function insertData($columns, $values, $link){
    $query = "INSERT INTO segments ".$columns." VALUES ".$values;
    $result = pg_exec($link, $query);
}

function clearAll($link){
    $result = pg_exec($link, "DELETE FROM segments");
}

;
function deleteRecord($rowId,$link){
    $result = pg_exec($link, "DELETE FROM segments WHERE Reference='".$rowId."'");
}
function getData( $query , $link) {

        $result = pg_exec($link, $query);
        $numrows = pg_numrows($result);
        $sql_results = array();

        for($ri = 0; $ri < $numrows; $ri++) {
            $row = pg_fetch_array($result, $ri);
            $sql_results[] = $row;
        }

        $jsonoutput = json_encode($sql_results);

     return $jsonoutput;
}

$source = $_POST['option'];
if ( $source == "insert"){

    $columns = "(";

    $values = "(";

    $rowId= "";

    foreach ($_POST as $key => $value){
        if( $key == "option"){
            continue;
        }

        if ( $key == "Reference"){
            $rowId = $value;
        }
        $columns = $columns.$key.",";
        $values = $values."'".str_replace("'","&#39;",$value)."',";


    }

    $columns = substr($columns, 0,strlen($columns)-1).")";
    $values = substr($values, 0,strlen($values)-1).")";

    echo deleteRecord($rowId,$link);
    echo insertData($columns, $values, $link);

} elseif ( $source == "data") {
    $ready_query = "select * from segments";
    echo getData( $ready_query , $link);

} elseif ( $source == "clear") {
    clearAll($link);
}

pg_close($link);

?>
