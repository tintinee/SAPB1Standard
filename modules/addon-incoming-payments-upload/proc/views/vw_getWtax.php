<?php 
session_start();
include('../../../../config/config.php');



$err = 0;
$errmsg = '';
$ItemCode = '';

$html = '';

$wtaxArray = array();
$cardCode = $_GET['cardCode'];
$wtaxCode = '';

	$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."]; 
	Select 
	T0.WTCode, 
	T0.WTName, 
	T0.Rate,	
	T0.Account
	
	FROM OWHT T0
	INNER JOIN CRD4 T1 ON T1.WTCode = T0.WTCode

	WHERE T1.CardCode = '$cardCode'");
	while (odbc_fetch_row($qry)) 
	{
		$wtaxCode = odbc_result($qry, 'WTCode');
		array_push($wtaxArray, $wtaxCode);
	}

	odbc_free_result($qry);
	odbc_close($MSSQL_CONN);		
	
	if ($err == 0) 
	{
		$data = array("valid"=>true, 
						"msg"=>"Operation completed successfully.",
						"wtaxCode"=>$wtaxArray,
						);
		echo json_encode($data);
	}
	else
	{
		$data = array("valid"=>false, 
					"msg"=>"Need to complete all details.",
					"html"=>$html);
		echo json_encode($data);
	}

?>
	