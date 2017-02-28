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

$p1 = $_GET['page1'];
$p2 = $_GET['page2'];

$query = "select * from segments where lower(Reference) like '%".$p1."%' or Reference like '%".$p2."%' ORDER BY Reference ASC";

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

echo getData($query , $link);

pg_close($link);

?>
