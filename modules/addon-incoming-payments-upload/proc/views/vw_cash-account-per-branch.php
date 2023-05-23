<?php 
session_start();
include('../../../../config/config.php');



	$err = 0;
	$errmsg = '';
	$newBranch = $_POST['newBranch'];
	$cashAccount = '';

	$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
		SELECT 
		T0.U_CashAccount
	
		FROM OBPL T0
		WHERE T0.BPLId = '$newBranch' ");
		
	while (odbc_fetch_row($qry)) 
		{
			$cashAccount = odbc_result($qry, "U_CashAccount");
			
		}
	
	
	if ($err == 0) 
	{
		$data = array("valid"=>true, 
						"cashAccount"=> $cashAccount);
		echo json_encode($data);
	}
	else
	{
		$data = array("valid"=>false, 
					"msg"=>"Need to complete all details.");
		echo json_encode($data);
	}

?>
	