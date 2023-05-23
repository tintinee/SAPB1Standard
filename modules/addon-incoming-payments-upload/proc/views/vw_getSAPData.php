<?php 
	session_start();
	include_once('../../../../config/config.php');

	$objSession = json_decode($_SESSION['AddOnTransOut']);

	$data = array();

	if ($_POST['need'] == 'itemCode') {

		$conditionArg = $_POST['conditionArg'];
		
		$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
			SELECT ItemCode FROM OITM WHERE ItemName = '$conditionArg'
		");

		$itemCode = '';

		while (odbc_fetch_row($qry)) 
		{
			$itemCode = odbc_result($qry, 'ItemCode');
		}

		$data['itemCode'] = $itemCode;

		odbc_free_result($qry);

	} else if ($_POST['need'] == 'cardName') {

		$conditionArg = $_POST['conditionArg'];
		
		$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
			SELECT CardName FROM OCRD WHERE CardCode = '$conditionArg'
		");

		$cardName = '';

		while (odbc_fetch_row($qry)) 
		{
			$cardName = odbc_result($qry, 'CardName');
		}

		$data['cardName'] = $cardName;

		odbc_free_result($qry);

	}

	echo json_encode($data);
?>