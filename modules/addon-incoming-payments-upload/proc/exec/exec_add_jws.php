<?php
$err = 0;
$errmsg = '';
session_start();
include('../../../../config/config.php');

$objSession = json_decode($_SESSION['AddOnTransOut']);

$docentry = '';

$SAPObj = json_decode($_POST['SAPObj']);
$txtSalesEmpCode = $_POST['txtSalesEmpCode'];
$txtOwnerCode = $_POST['txtOwnerCode'];
$branchId = $_POST['branchId'];
$txtJournalMemo = $_POST['txtJournalMemo'];
$serviceType = $_POST['serviceType'];

$txtContactPerson = '';

	$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
		SELECT CntctCode FROM OCPR WHERE CardCode = '$SAPObj->cardCode'																		
	");

	while (odbc_fetch_row($qry)) 
	{
		$txtContactPerson = odbc_result($qry, 'CntctCode');
	}
	odbc_free_result($qry);

if ($err == 0) 
{
	include('../../../connect/connect.php');
	
	$vCmp=new COM("SAPbobsCOM.company") or die ("No connection");
	
	$vCmp->DbServerType = $DbServerType;
	$vCmp->server =  $server;
	$vCmp->UseTrusted =$UseTrusted;
	$vCmp->DBusername = $DBusername;
	$vCmp->DBpassword = $DBpassword;
	$vCmp->CompanyDB = $CompanyDB;
	$vCmp->username = $username;
	$vCmp->password = $password;
	$vCmp->LicenseServer = $LicenseServer;
	
	$errid = 0;


    
	$lRetCode = $vCmp->Connect;
		
	if ($lRetCode != 0) 
	{
		$errmsg .= $vCmp->GetLastErrorDescription;
		$err += 1;
	}
	else
	{
			$oRdr = $vCmp->GetBusinessObject($objSession->toObjectType);
		
			$oRdr->CardCode = $SAPObj->cardCode;
			$oRdr->TaxDate = $SAPObj->date;
			$oRdr->DocDueDate = $SAPObj->date;
			$oRdr->DocDate = $SAPObj->date;

			if($txtContactPerson != ''){
				$oRdr->ContactPersonCode = $txtContactPerson;
			}
			
			$oRdr->NumAtCard  = $SAPObj->refNo;
			$oRdr->BPL_IDAssignedToInvoice = $branchId;
			
			$oRdr->ShipToCode = '';
			$oRdr->PayToCode = '';

			// $oRdr->SalesPersonCode  = $txtSalesEmpCode;
			
			// $oRdr->DocumentsOwner  = $txtOwnerCode;
			
			// $oRdr->JournalMemo = $txtJournalMemo;
			
			$oRdr->DiscountPercent = 0;
			
			$serviceType2 = $serviceType == "I" ? 0 : 1;
			$oRdr->DocType = $serviceType2;

			$oRdr->ControlAccount = '11261000002';
			
			$UDF = $oRdr->UserFields;

			$UDF->Fields['U_TransType_AR']->Value = 'TransOut';

			$docObj = $oRdr->Lines;
			
			foreach ($SAPObj->detailLines as $line) {

				$docObj->ItemCode = $line->itemCode;
				$docObj->Quantity = $line->quantity;

					$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
						SELECT IUoMEntry FROM OITM WHERE ItemCode = '$line->itemCode'
					");

					$uomEntry;

					while (odbc_fetch_row($qry)) 
					{
						$uomEntry = odbc_result($qry, 'IUoMEntry');
						break;
					}
					odbc_free_result($qry);

				$docObj->UoMEntry = $uomEntry;
				$docObj->PriceAfterVAT = $line->cost;

				$count = 0;

				$field = $line->udf[$count]->columnName;
				$val = $line->udf[$count]->value;

				$docObj->UserFields->Fields[$field]->Value = $val;

				$docObj->Add();
			}
		
			$retval = $oRdr->Add();
			if ($retval != 0) 
			{
				$errmsg .= $vCmp->GetLastErrorDescription;
				$err += 1;
			}
			else
			{
				$vCmp->GetNewObjectCode($docentry);
		
			}	  
	}
}

if ($err == 0) 
{
	$data = array("valid"=>true, 
						"msg"=>"Operation completed successfully - " .$docentry,
						"docref"=>$docentry,
						"docentry"=>$docentry);
	echo json_encode($data);
	exit();
}
else
{
	$data = array("valid"=>false, "msg"=>$errmsg);
	echo json_encode($data);
	exit();
}

?>