<?php
session_start();
include_once('../../../../config/config.php');


$cardcode = $_GET['cardcode'];
$serviceType = $_GET['serviceType'];
?>
<table id="tblDetails" class="table table-striped table-bordered table-sm detailsTable" cellspacing="0"  style="background-color: white; width:100% !important;"  cellspacing="0">
  <thead   style="border-bottom: 0 !important; ">
    <tr >
		  <th class="text-right" style=" color: black;">#</th>
		  <th style="color: black; min-width:100px; ">Select</th>
	    <th style="color: black; min-width:150px; ">Document No.</th>
	    <th style="color: black; min-width:150px;" >Document Type</th>
		<th style="color: black; min-width:150px; ">Customer Ref No.</th>
	    <th style="color: black; min-width:150px;">Date</th>
		  <th style="color: black; min-width:150px;">Total</th>
		  <th style="color: black; min-width:150px;">Balance Due</th>
	    <th style="color: black; min-width:150px;">Total Payment</th>
	    <th style="color: black; min-width:150px;">WTax Amount</th>
	     <th style="color: black; min-width:150px;">Doc. Remarks</th>
    </tr>
  </thead>
  <tbody class="">


<?php



$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
	SELECT DISTINCT
		T0.BPLId ,
		CASE 
			WHEN T0.ObjType = 18 THEN 'PU'
			WHEN T0.ObjType = 14 THEN 'CM'
			WHEN T0.ObjType = 30 THEN 'JE'
		END AS ObjType,
		T0.NumAtCard,
		T0.DocDate,
		T0.DocNum,
		T0.DocEntry,
		T0.CardCode,
		T0.CardName,
		T0.NumAtCard,
		T0.DocTotal - T0.PaidSum AS Balance,
		T0.DocTotal,
		T0.WTApplied,
		T0.Comments
	FROM OPCH T0
	LEFT JOIN OBPL T1 ON T1.BPLId = T0.BPLId
	WHERE T0.CardCode = '$cardcode' AND T0.DocStatus = 'O'
		
	UNION ALL

	SELECT DISTINCT
		T0.BPLId ,
		CASE 
			WHEN T0.ObjType = 18 THEN 'PU'
			WHEN T0.ObjType = 14 THEN 'CM'
			WHEN T0.ObjType = 30 THEN 'JE'
		END AS ObjType,
		T0.NumAtCard,
		T0.DocDate,
		T0.DocNum,
		T0.DocEntry,
		T0.CardCode,
		T0.CardName,
		T0.NumAtCard,
		T0.DocTotal - T0.PaidSum AS Balance,
		T0.DocTotal,
		T0.WTApplied,
		T0.Comments
	FROM ORPC T0
	LEFT JOIN OBPL T1 ON T1.BPLId = T0.BPLId	
	WHERE T0.CardCode = '$cardcode' AND T0.DocStatus = 'O'


	ORDER BY T0.DocNum");
$ctr = 1;

while (odbc_fetch_row($qry)) 
{
	
	$bplid2 = odbc_result($qry, 'BPLId');
	$ObjType = odbc_result($qry, 'ObjType');
	$NumAtCard = odbc_result($qry, 'NumAtCard');
	$DocDate = date('Y-m-d' ,strtotime(odbc_result($qry, 'DocDate')));
	$DocNum = odbc_result($qry, 'DocNum');
	$DocEntry = odbc_result($qry, 'DocEntry');
	$CardCode = odbc_result($qry, 'CardCode');
	$CardName = odbc_result($qry, 'CardName');
	$NumAtCard = odbc_result($qry, 'NumAtCard');
	$Balance = number_format(odbc_result($qry, 'Balance'),2);
	$WTApplied = number_format(odbc_result($qry, 'WTApplied'),2);
	$DocTotal = number_format(odbc_result($qry, 'DocTotal'),2);
	$Comments = odbc_result($qry, 'Comments');

	
				if($serviceType == 'S'){
   
					echo 
					'<tr style="background-color: white; "  >
					  <td class="rowno text-right" style="background-color: lightgray;color:black;">
						<span>'.$ctr.'</span>
					
					  </td>
					 	<td style="min-width:50px">
					  	<center>
								<input type="checkbox" style=" height:20px ; width:20px " class="form-control matrix-cell chkboxInvoice ">
							</center>
						</td>
				    <td >
							<input type="text" class="form-control docnum d-none"  aria-label=" aria-describedby="button-addon2" style="outline: none; border:none; " readonly value="'. $DocEntry .'"/>
							<input type="text" class="form-control docnum2"  aria-label=" aria-describedby="button-addon2" style="outline: none; border:none; " readonly value="'. $DocNum .'"/>

					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell documenttype"  style="outline: none; border:none" readonly value="'. $ObjType .'"/>
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell numatcard"  style="outline: none; border:none" readonly value="'. $NumAtCard .'"/>
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell date"  aria-label=" aria-describedby="button-addon2" style="outline: none; border:none" readonly value="'. $DocDate .'"/>
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right total"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/  value="'. $DocTotal .'">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right balancedue"   style="outline: none; border:none" maxlength="8" readonly value="'. $Balance .'"/>
							<input type="text" class="form-control matrix-cell text-right balancedue2 d-none"   style="outline: none; border:none" maxlength="8" readonly value="'. $Balance .'"/>
						
					  </td>
					  <td >
					  		<input type="text" class="form-control matrix-cell text-right totalpayment" aria-label="" maxlength="12" />
                      </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right wtaxamount"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/ value="'. $WTApplied .'">
					  </td>
					   <td >
							<input type="text" class="form-control matrix-cell comments"  style="outline: none; border:none" readonly value="'. $Comments .'"/>
					  </td>
					</tr>'
					;
			
					$ctr += 1;
				}
				else{
				
				}
				
				
}

?>
  </tbody>
  <tfoot style="z-index: 999;  background-color: lightgray; " class="d-none">
		<tr style="background-color: lightgray; z-index: 999">
			<th class="text-right" style=" color: black">#</th>
			<th style="color: black; min-width:50px; ">Select</th>
		  <th style="color: black; min-width:50px; ">Select</th>
	    <th style="color: black; min-width:150px; ">Document No.</th>
	    <th style="color: black; min-width:150px;" >Document Type</th>
		<th style="color: black; min-width:150px; ">Customer Ref No.</th>
	    <th style="color: black; min-width:150px;">Date</th>
		  <th style="color: black; min-width:150px;">Overdue Days</th>
		  <th style="color: black; min-width:300px;">Total</th>
	    <th style="color: black; min-width:300px;">Total Payment</th>
		  <th style="color: black; min-width:300px;">Balance Due</th>
	    <th style="color: black; min-width:300px;">WTax Amount</th>
		</tr>
	  </tfoot>
</table>

<?php

odbc_free_result($qry);
odbc_close($MSSQL_CONN);

?>
