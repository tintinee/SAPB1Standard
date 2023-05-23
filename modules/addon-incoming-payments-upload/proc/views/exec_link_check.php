<?php
session_start();
include_once('../../../../config/config.php');

$userid = '';
$err = 0;
$errmsg = '';


$itemCode = $_POST['itemCode'];


$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
	SELECT 
		COUNT(T0.ItemCode) AS ItemCode
		
	FROM OITM T0 
	

	WHERE T0.ItemCode = '$itemCode'");

while (odbc_fetch_row($qry)) 
{
	if(odbc_result($qry, "ItemCode") == 0){
		$err + 1;
	}
}

if ($err == 0) 
{
	$data = array("valid"=>true, 
						"msg"=> 'Successful');
	echo json_encode($data);
}
else
{
	$errmsg = 'Item Code/Name do not exist';
	$data = array("valid"=>false, "msg"=>$errmsg);
	echo json_encode($data);
}

?>