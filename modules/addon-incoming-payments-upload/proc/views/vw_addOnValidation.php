<?php 
	session_start();
	include_once('../../../../config/config.php');

	$objSession = json_decode($_SESSION['AddOnTransOut']);

	$data = array();

	if ($_POST['subject'] == 'branchName') {
		$branchName = str_replace(array('.', ',', '-', ' '), '' , $_POST['primValue']);

		$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
			SELECT
				REPLACE(
					REPLACE(
						REPLACE(
							REPLACE(BPLName, ',', ''),
							'.', ''),
						'-', ''),
					' ', '') AS BPLNameEdit, BPLName
			FROM OBPL
		");

		$branchError = true;

		while (odbc_fetch_row($qry)) 
		{
			if (strtolower(odbc_result($qry, 'BPLNameEdit')) == strtolower($branchName)) {
				$branchError = false;
				$data['branchName'] = odbc_result($qry, 'BPLName');
				break;
			}
		}

		if ($branchError) {
			$data['error'] = true;
			$data['message'] = 'Branch Name does not exist';
			$data['branchName'] = $_POST['primValue'];
			odbc_free_result($qry);
			echo json_encode($data);
			exit();
		}

		odbc_free_result($qry);

	} else if ($_POST['subject'] == 'line') {
		$obj = json_decode($_POST['obj']);

		$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
			SELECT COUNT(*) AS NumRows FROM $obj->toChildTable1 WHERE U_TRANSNO = '$obj->transNo' 
		");

		while (odbc_fetch_row($qry)) 
		{
			if (odbc_result($qry, 'NumRows') > 0) {
				$data['error'] = true;
				$data['message'] = 'Cannot add document, same transaction already exist';
				odbc_free_result($qry);
				echo json_encode($data);
				exit();
			}
		}

		odbc_free_result($qry);

		$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
			SELECT ItemName FROM OITM WHERE ItemName = '$obj->items' 
		");

		if (odbc_num_rows($qry) == 0) {
			$data['error'] = true;
			$data['message'] = 'Item Code/Name does not exist';
			odbc_free_result($qry);
			echo json_encode($data);
			exit();
		}

		odbc_free_result($qry);

		$strArr = explode(' ', $obj->storeName);
		$wildCard = str_replace('RR', '', $strArr[0]);

		$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
			SELECT CardCode FROM OCRD WHERE CardType = '$objSession->cardType' AND CardCode LIKE '$wildCard%'
		");

		if (odbc_num_rows($qry) == 0) {
			$data['error'] = true;
			$data['message'] = 'Business Partner does not exist';
			odbc_free_result($qry);
			echo json_encode($data);
			exit();
		}

		odbc_free_result($qry);

	} else if ($_POST['subject'] == 'itemStock') {
		$obj = json_decode($_POST['obj']);

		$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
			SELECT 
				A.OnHand
			FROM OITW A 
				LEFT JOIN OBPL B ON B.DflWhs = A.WhsCode
				LEFT JOIN OITM C ON C.ItemCode = A.ItemCode
			WHERE B.BPLId = '$obj->branchId' AND C.ItemCode = '$obj->itemCode'
		");

		while (odbc_fetch_row($qry)) 
		{
			if (odbc_result($qry, 'OnHand') == 0) {
				$data['error'] = true;
				$data['message'] = 'No item stock';
				odbc_free_result($qry);
				echo json_encode($data);
				exit();
			} else if (odbc_result($qry, 'OnHand') < $obj->quantity) {
				$data['error'] = true;
				$data['message'] = 'The remaining number of item stocks is '.odbc_result($qry, 'OnHand').'.';
				odbc_free_result($qry);
				echo json_encode($data);
				exit();
			} else {
				$data['itemStocksDetails'] = 'The current number of item stocks is '.number_format(odbc_result($qry, 'OnHand')).'.';
			}
		}

		odbc_free_result($qry);
	} else if ($_POST['subject'] == 'uomCode') {
		$obj = json_decode($_POST['obj']);

		$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
			SELECT  
				UomEntry 
			FROM OITM 
				LEFT JOIN OUOM  ON IUoMEntry = UomEntry 
			WHERE UomCode LIKE '$obj->unit%'
		");

		$uoMEntry = '';

		while (odbc_fetch_row($qry)) 
		{
			$uoMEntry = odbc_result($qry, 'UomEntry');
			break;
		}

		odbc_free_result($qry);

		$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
			SELECT 
				UomEntry
			FROM OUGP A
				LEFT JOIN UGP1 B ON B.UgpEntry = A.UgpEntry
			WHERE UgpCode = '$obj->itemCode' AND UomEntry = $uoMEntry
		");

		if (odbc_num_rows($qry) == 0) {
			odbc_free_result($qry);
			
			$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
				SELECT  
					UomCode  
				FROM OITM 
					LEFT JOIN OUOM  ON IUoMEntry = UomEntry 
				WHERE ItemCode = '$obj->itemCode'
			");

			while (odbc_fetch_row($qry)) 
			{
				$data['message'] = 'SAP default UoM Code for this item is '.strtoupper(odbc_result($qry, 'UomCode')).'.';
			}

			$data['error'] = true;
			odbc_free_result($qry);
			echo json_encode($data);
			exit();
		}

		

		odbc_free_result($qry);
	}
	
	$data['error'] = false;
	$data['message'] = 'No errors found';

	echo json_encode($data);
?>