<?php
$err = 0;
$errmsg = '';
session_start();
include('../../../../config/config.php');

$objSession = json_decode($_SESSION['ARInvoiceArr']);

$docentry = '';

$txtDocNum  =  $_POST["txtDocNum"];
$txtCardCode = $_POST['txtCardCode'];
$txtPostingDate  = $_POST['txtPostingDate'];
$txtDeliveryDate  = $_POST['txtDeliveryDate'];
$txtDocumentDate  = $_POST['txtDocumentDate'];
$txtContactPerson   = $_POST['txtContactPerson'];
$txtCustomerRefNo  = $_POST['txtCustomerRefNo'];
$txtSalesEmpCode  = $_POST['txtSalesEmpCode'];
$txtOwnerCode  = $_POST['txtOwnerCode'];
$txtRemarks = $_POST['txtRemarks'];
$selShipToAddress  = $_POST['selShipToAddress'];
$selBillToAddress  = $_POST['selBillToAddress'];
$txtJournalMemo  = $_POST['txtJournalMemo'];
$txtPaymentTermsCode = $_POST['txtPaymentTermsCode'];
// $txtCancellationDate  = $_POST['txtCancellationDate'];
// $txtRequiredDate = $_POST['txtRequiredDate'];
//$txtTinNumber = $_POST['txtTinNumber'];

$txtFooterDiscountPercentage = $_POST['txtFooterDiscountPercentage'];

$txtStreetPOBoxS = $_POST['txtStreetPOBoxS'];
$txtCityS = $_POST['txtCityS'];
$txtZipCodeS = $_POST['txtZipCodeS'];
$txtCountryS = $_POST['txtCountryS'];
$txtStreetPOBoxB = $_POST['txtStreetPOBoxB'];
$txtCityB = $_POST['txtCityB'];
$txtZipCodeB = $_POST['txtZipCodeB'];
$txtCountryB = $_POST['txtCountryB'];
$selShippingType = $_POST['selShippingType'];

$serviceType  = $_POST['serviceType'];

$json = $_POST['json'];
$jsonDeleteRow = $_POST['jsonDeleteRow'];
$udfJson = $_POST['udfJson'];

$refDocToObj = json_decode($_POST['refDocToObj']);
$objectType = $_POST['objectType'];
$childTable21 = $_POST['childTable21'];


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
			$oRdr = $vCmp->GetBusinessObject($objSession->objectType);
			$oRdr->GetByKey($txtDocNum);
			
			$oRdr->TaxDate = $txtDocumentDate;
			$oRdr->DocDueDate = $txtDeliveryDate;
			$oRdr->DocDate = $txtPostingDate;
			if($txtContactPerson != ''){
				$oRdr->ContactPersonCode = $txtContactPerson;
			}
			
			$oRdr->NumAtCard  = $txtCustomerRefNo;
			
			$oRdr->Comments  = $txtRemarks;
			if($txtSalesEmpCode != ''){
				$oRdr->SalesPersonCode  = $txtSalesEmpCode;
			}
			$oRdr->DocumentsOwner  = $txtOwnerCode;
			$oRdr->DiscountPercent  = $txtOwnerCode;
			
			
			$oRdr->ShipToCode = $selShipToAddress;
			$oRdr->PayToCode = $selBillToAddress;
			
			$oRdr->JournalMemo = $txtJournalMemo;
			if($txtPaymentTermsCode != ''){
				$oRdr->PaymentGroupCode = $txtPaymentTermsCode;
			}
			
			// $oRdr->CancelDate = $txtCancellationDate;
			// $oRdr->RequriedDate = $txtRequiredDate;
			
			$txtFooterDiscountPercentage = $txtFooterDiscountPercentage == "" ? 0 : $txtFooterDiscountPercentage;
			$oRdr->DiscountPercent = $txtFooterDiscountPercentage;
			
			$serviceType2 = $serviceType == "I" ? 0 : 1;
			$oRdr->DocType = $serviceType2;
			
			if($selShippingType != ''){
				$oRdr->TransportationCode = $selShippingType;
			}
			$oRdr->AddressExtension->ShipToStreet = $txtStreetPOBoxS;
			$oRdr->AddressExtension->ShipToCity = $txtCityS;
			$oRdr->AddressExtension->ShipToZipCode = $txtZipCodeS;
			$oRdr->AddressExtension->ShipToCountry = $txtCountryS;
			$oRdr->AddressExtension->BillToStreet = $txtStreetPOBoxB;
			$oRdr->AddressExtension->BillToCity = $txtCityB;
			$oRdr->AddressExtension->BillToZipCode = $txtZipCodeB;
			$oRdr->AddressExtension->BillToCountry = $txtCountryB;
			
			if($jsonDeleteRow != ''){
				$deleteLineNo = json_decode(stripslashes($jsonDeleteRow));
				foreach ($deleteLineNo as $key => $value) 
				{
					if ($serviceType == 'I') 
					{
						$oPrQ->Lines->SetCurrentLine($value[0]);
						$oPrQ->Lines->Delete();
						
					}
				}
			}
			
			$udfJson = json_decode(stripslashes($udfJson));
				foreach ($udfJson as $key => $value) 
				{
					$oRdr->UserFields->Fields[$value[1]]->Value = $value[0];
				}
			
			
			
		
			$retval = $oRdr->Update();
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
	updateRefDocModal($MSSQL_CONN, $MSSQL_DB, $refDocToObj, $childTable21, $txtDocNum, $objectType);
	$data = array("valid"=>true, 
						"msg"=>"Operation completed successfully - " .$docentry,
						"docref"=>$docentry,
						"docentry"=>$docentry);
	echo json_encode($data);
}
else
{
	$data = array("valid"=>false, "msg"=>$errmsg);
	echo json_encode($data);
}



function updateRefDocModal($MSSQL_CONN, $MSSQL_DB, $refDocToObj, $childTable21, $txtDocNum, $objectType){
	if (count($refDocToObj->updateRemarks) > 0) {
		foreach ($refDocToObj->updateRemarks as $item) {
			if ($item->Remark == '') {
				$updateQry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."]; 
					UPDATE $childTable21 
					SET Remark = NULL
					WHERE DocEntry = $txtDocNum 
					AND RefObjType = {$item->RefTable->objectType} 
					AND RefDocEntr = $item->RefDocNum
				");
			} else {
				$updateQry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."]; 
					UPDATE $childTable21 
					SET Remark = '$item->Remark'
					WHERE DocEntry = $txtDocNum 
					AND RefObjType = {$item->RefTable->objectType} 
					AND RefDocEntr = $item->RefDocNum
				");
			}

			odbc_free_result($updateQry);
		}

	}

	if (count($refDocToObj->delete) > 0) {
		foreach ($refDocToObj->delete as $item) {
			$deleteQry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."]; 
				DELETE FROM $childTable21 
				WHERE DocEntry = $txtDocNum  
				AND RefObjType = {$item->RefTable->objectType} 
				AND RefDocEntr = $item->RefDocNum
			");

			odbc_free_result($deleteQry);
		}

	}

	if (count($refDocToObj->add) > 0) {
		foreach ($refDocToObj->add as $item) {
			if ($item->Remark == '') {
				$addQry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."]; 
					INSERT INTO $childTable21
						(DocEntry, ObjectType, LineNum, RefDocEntr, RefDocNum, ExtDocNum, RefObjType, IssueDate, Model, RefAccKey, RefAmount, Remark, LinkRefTyp)
					VALUES
						($txtDocNum, $objectType, $item->LineNum, $item->RefDocNum, $item->RefDocNum, '', {$item->RefTable->objectType}, (SELECT DocDate FROM {$item->RefTable->objectTable} WHERE DocEntry = $item->RefDocNum), 0, '', 0.00, NULL, '00')
				");
			} else {
				$addQry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."]; 
					INSERT INTO $childTable21
						(DocEntry, ObjectType, LineNum, RefDocEntr, RefDocNum, ExtDocNum, RefObjType, IssueDate, Model, RefAccKey, RefAmount, Remark, LinkRefTyp)
					VALUES
						($txtDocNum, $objectType, $item->LineNum, $item->RefDocNum, $item->RefDocNum, '', {$item->RefTable->objectType}, (SELECT DocDate FROM {$item->RefTable->objectTable} WHERE DocEntry = $item->RefDocNum), 0, '', 0.00, '$item->Remark', '00')
				");
			}
			
			odbc_free_result($addQry);
		}

	}

	$updateQry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."]; 
		UPDATE $childTable21 
		SET ExtDocNum = '', Model = 0, RefAccKey = '', RefAmount = 0.00, LinkRefTyp = '00'
		WHERE DocEntry = $txtDocNum 
	");
}	

?>