<?php
$err = 0;
$errmsg = '';
session_start();
include('../../../../config/config.php');

$objSession = json_decode($_SESSION['AddOnTransOut']);

$docentry = '';
$docentry2 = '';

$json = $_POST['json'];
$json1 = $_POST['json1'];
$json2 = $_POST['json2'];
$json3 = $_POST['json3'];
$json4 = $_POST['json4'];
$json5 = $_POST['json5'];
$json6 = $_POST['json6'];
$json7 = $_POST['json7'];
$json8 = $_POST['json8'];
$json9 = $_POST['json9'];
$json10 = $_POST['json10'];

$txtBplId  = $_POST['txtBplId'];
$txtCardCode  = $_POST['txtCardCode'];
$txtPostingDate  = $_POST['txtPostingDate'];
$txtTransferDate = $_POST['txtTransferDate']; 
$txtTransferGLCode = $_POST['txtTransferGLCode']; 
$txtTransferRef = $_POST['txtTransferRef']; 
$txtRemarks = $_POST['txtRemarks']; 
$txtRemarks2 = $_POST['txtRemarks2']; 
$txtWtLiableArray = $_POST['txtWtLiableArray']; 

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
			$oRdr = $vCmp->GetBusinessObject(14);
		

			$oRdr->CardCode = $txtCardCode;
			//$oRdr->TaxDate = $txtPostingDate;
			//$oRdr->DocDueDate =  $txtPostingDate;
			$oRdr->DocDate =  $txtPostingDate;
			$oRdr->Comments =  $txtRemarks;
			
			$oRdr->BPL_IDAssignedToInvoice  = $txtBplId;
			
	
			
			$oRdr->DocType = 1;
			$ewtAmount = 0.00;
			if(json_decode($json5) != null) 
			{
				$json5 = json_decode($json5, true);
				$setcurrentline = 0;
				foreach ($json5 as $key => $value) 
				{
						if($value[2] != '0'){

							$ewtAmount +=  $value[2];
							
					}
				}
			} 


			// if ($txtWtLiableArray != ''){
			
			// $WTCodeArray = explode(",",$txtWtLiableArray);
			// $WTCodeLength = count($WTCodeArray);
			// for($i = 0; $i < $WTCodeLength; $i ++){
			// 	// $oRdr->WithholdingTaxData->WTCode = $WTCodeArray[$i];

				$oRdr->WithholdingTaxData->WTCode = 'C120';
				$oRdr->WithholdingTaxData->WTAmount = $ewtAmount;
				 $oRdr->WithholdingTaxData->Add();
				// }
				
			// }
			//$oRdr->WTSum =  50.00;
			$WtLiableYesNo = 0;
			if($ewtAmount > 0){
				$WtLiableYesNo = 1;
			}
			else{
				$WtLiableYesNo = 0;
			}
			if(json_decode($json8) != null) 
			{
				$json8 = json_decode($json8, true);
				$setcurrentline = 0;
				foreach ($json8 as $key => $value) 
				{
							if($value[2] != '0'){
							$oRdr->Lines->AccountCode = $value[0];
							$oRdr->Lines->ItemDescription = $value[1];
							$oRdr->Lines->UnitPrice = $value[2]; 
							$oRdr->Lines->VatGroup = 'OVAT-E';
							$oRdr->Lines->WtLiable = $WtLiableYesNo;
							$oRdr->Lines->Add();
							$setcurrentline++;
				}
				}
			} 
			if(json_decode($json) != null) 
			{
				$json = json_decode($json, true);
				$setcurrentline = 0;
				foreach ($json as $key => $value) 
				{
							if($value[2] != '0'){
							$oRdr->Lines->AccountCode = $value[0];
							$oRdr->Lines->ItemDescription = $value[1];
							$oRdr->Lines->UnitPrice = $value[2]; 
							$oRdr->Lines->VatGroup = 'OVAT-E';
							$oRdr->Lines->WtLiable = $WtLiableYesNo;
							$oRdr->Lines->Add();
							$setcurrentline++;
				}
				}
			} 
			if(json_decode($json6) != null) 
			{
				$json6= json_decode($json6, true);
				$setcurrentline = 0;
				foreach ($json6 as $key => $value) 
				{
						if($value[2] != '0'){
							$oRdr->Lines->AccountCode = $value[0];
							$oRdr->Lines->ItemDescription = $value[1];
							$oRdr->Lines->UnitPrice = $value[2]; 
							$oRdr->Lines->VatGroup = 'OVAT-E';
							$oRdr->Lines->WtLiable = $WtLiableYesNo;
							$oRdr->Lines->Add();
							$setcurrentline++;
				}
				}
			} 
			if(json_decode($json1) != null) 
			{
				$json1= json_decode($json1, true);
				$setcurrentline = 0;
				foreach ($json1 as $key => $value) 
				{
						if($value[2] != '0'){
							$oRdr->Lines->AccountCode = $value[0];
							$oRdr->Lines->ItemDescription = $value[1];
							$oRdr->Lines->UnitPrice = $value[2]; 
							$oRdr->Lines->VatGroup = 'OVAT-E';
							$oRdr->Lines->WtLiable = $WtLiableYesNo;

					
							$oRdr->Lines->Add();
							$setcurrentline++;
				}
				}
			} 
			if(json_decode($json2) != null) 
			{
				$json2 = json_decode($json2, true);
				$setcurrentline = 0;
				foreach ($json2 as $key => $value) 
				{
						if($value[2] != '0'){
							$oRdr->Lines->AccountCode = $value[0];
							$oRdr->Lines->ItemDescription = $value[1];
							$oRdr->Lines->UnitPrice = $value[2]; 
							$oRdr->Lines->VatGroup = 'OVAT-E';
							$oRdr->Lines->WtLiable = $WtLiableYesNo;
							$oRdr->Lines->Add();
							$setcurrentline++;
				}
				}
			} 
			if(json_decode($json3) != null) 
			{
				$json3 = json_decode($json3, true);
				$setcurrentline = 0;
				foreach ($json3 as $key => $value) 
				{
						if($value[2] != '0'){
							$oRdr->Lines->AccountCode = $value[0];
							$oRdr->Lines->ItemDescription = $value[1];
							$oRdr->Lines->UnitPrice = $value[2]; 
							$oRdr->Lines->VatGroup = 'OVAT-E';
							$oRdr->Lines->WtLiable = $WtLiableYesNo;
							$oRdr->Lines->Add();
							$setcurrentline++;
				}
				}
			} 
			if(json_decode($json4) != null) 
			{
				$json4 = json_decode($json4, true);
				$setcurrentline = 0;
				foreach ($json4 as $key => $value) 
				{
						if($value[2] != '0'){
							$oRdr->Lines->AccountCode = $value[0];
							$oRdr->Lines->ItemDescription = $value[1];
							$oRdr->Lines->UnitPrice = $value[2]; 
							$oRdr->Lines->VatGroup = 'OVAT-E';
							$oRdr->Lines->WtLiable = $WtLiableYesNo;
							$oRdr->Lines->Add();
							$setcurrentline++;
				}
				}
			} 
			// if(json_decode($json5) != null) 
			// {
			// 	$json5 = json_decode($json5, true);
			// 	$setcurrentline = 0;
			// 	foreach ($json5 as $key => $value) 
			// 	{
			// 			if($value[2] != '0'){
			// 				$oRdr->Lines->AccountCode = $value[0];
			// 				$oRdr->Lines->ItemDescription = $value[1];
			// 				$oRdr->Lines->UnitPrice = $value[2]; 
			// 				$oRdr->Lines->VatGroup = 'OVAT-E';
					
			// 				$oRdr->Lines->Add();
			// 				$setcurrentline++;
			// 	}
			// 	}
			// } 
			if(json_decode($json9) != null) 
			{
				$json9 = json_decode($json9, true);
				$setcurrentline = 0;
				foreach ($json9 as $key => $value) 
				{
						if($value[2] != '0'){
							$oRdr->Lines->AccountCode = $value[0];
							$oRdr->Lines->ItemDescription = $value[1];
							//if($value[2] > 0){
							$oRdr->Lines->UnitPrice = $value[2]; 
						//}
							$oRdr->Lines->VatGroup = 'OVAT-E';
							$oRdr->Lines->WtLiable = $WtLiableYesNo;
							$oRdr->Lines->Add();
							$setcurrentline++;
				}
				}
			} 
			if(json_decode($json10) != null) 
			{
				$json10 = json_decode($json10, true);
				$setcurrentline = 0;
				foreach ($json10 as $key => $value) 
				{
						if($value[2] != '0'){
							$oRdr->Lines->AccountCode = $value[0];
							$oRdr->Lines->ItemDescription = $value[1];
							//if($value[2] > 0){
							$oRdr->Lines->UnitPrice = $value[2]; 
						//}
							$oRdr->Lines->VatGroup = 'OVAT-E';
							$oRdr->Lines->WtLiable = $WtLiableYesNo;
							$oRdr->Lines->Add();
							$setcurrentline++;
				}
				}
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
				
					// $qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
					// UPDATE ORIN SET WTSum = 30.00 WHERE DocEntry = $docentry ");

					$oRct = $vCmp->GetBusinessObject(24);
		
					$txtTransferAmount = 0;
					$oRct->CardCode = $txtCardCode;
					$oRct->BPLID = $txtBplId;
					$oRct->DocDate = $txtPostingDate;
					$oRct->DueDate = $txtPostingDate;
					$oRct->TaxDate = $txtPostingDate;
					$oRct->Remarks = $txtRemarks2;
					$SumAppliedForCreditMemo = 0;
					

					$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
						SELECT 
							T0.DocTotal * -1 AS DocTotal
					
						FROM ORIN T0
						WHERE T0.DocEntry = $docentry");
						
					while (odbc_fetch_row($qry)) 
						{
							$SumAppliedForCreditMemo = odbc_result($qry, "DocTotal");
						}

						odbc_free_result($qry);


						$oRct->Invoices->DocEntry = $docentry;
						$oRct->Invoices->SumApplied = $SumAppliedForCreditMemo;

						$oRct->Invoices->InvoiceType = 14;
		               				
						$oRct->Invoices->Add();	


						
						

					if(json_decode($json7) != null) 
					{
							$json7 = json_decode($json7, true);
							$ctr = 0;
						 	foreach ($json7 as $key => $value) {
								

								// $oRdr->Lines->UserFields->Fields["U_Source"]->Value = $value[1];


								$oRct->Invoices->DocEntry = $value[0];
								$oRct->Invoices->SumApplied = $value[1];
								//if($value[2] != ''){
									// $docObj->UserFields->Fields['U_InvoiceOverPayment']->Value = number_format($value[2],2);
								//}
								$docObj = $oRct->Invoices;
								if($value[2] != ''){
									$float = floatval($value[2]);
									$number_format = number_format($value[2]);
									$docObj->UserFields->Fields['U_InvoiceOverPayment']->Value = $value[2];
								}
								else if($value[3] != ''){
									$float = floatval($value[3]);
									$number_format = number_format($value[3]);
									$docObj->UserFields->Fields['U_InvoiceOverPayment']->Value = $value[3];
								}
								else{

								}
								$oRct->Invoices->InvoiceType = 13;
				               				
								$oRct->Invoices->Add();	
								
								$txtTransferAmount += $value[1];
							}	 
					}

						$newAmount = $txtTransferAmount + $SumAppliedForCreditMemo;
						$oRct->TransferSum = $newAmount;
			  			$oRct->TransferDate = $txtTransferDate;
			   			$oRct->TransferAccount = $txtTransferGLCode;
			  			$oRct->TransferReference = $txtTransferRef;


			  	$retval2 = $oRct->Add();
				if ($retval2 != 0) 
				{
					$errmsg .= $vCmp->GetLastErrorDescription;
					$err += 1;
				}
				else
				{
					$vCmp->GetNewObjectCode($docentry2);
	
				}	 
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