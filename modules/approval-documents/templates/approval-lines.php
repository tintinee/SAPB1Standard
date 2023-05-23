<?php
session_start();
include_once('../../../config/config.php');
	
	$EmpId = $_SESSION['SESS_EMP'];
	$EmpName = $_SESSION['SESS_NAME'];
	$status = $_GET['status'];
	$statusWhere = '';
	if($status == 'All'){
		$statusWhere = '';
	}
	else if($status == 'Approved'){
		$statusWhere = " AND U_ApprovalCodes != '' AND U_ApprovalCodes = 'Approved'";
	}
	else if($status == 'Pending'){
		$statusWhere = " AND U_ApprovalCodes != '' AND U_ApprovalCodes != 'Rejected' AND U_ApprovalCodes != 'Approved'";
	}
	else if($status == 'Rejected'){
		$statusWhere = " AND U_ApprovalCodes != '' AND U_ApprovalCodes = 'Rejected'";
	}
?>

<div class="">
<table id="tblForApproval" class="table table-striped table-bordered table-hover table-lg detailsTable"   style="background-color: white; width= 100%">
										  <thead style="border-bottom: 0 !important">
										    <tr>
											  	<th class="text-right" style=" color: black; max-width:30px;" >#</th>
										      <th style="color: black; max-width:100px; ">Doc Num.</th>
										      <th style="color: black; max-width:100px;" >ObjType</th>
										      <th style="color: black; min-width:100px;">Doc Total</th>
										      <th style="color: black; min-width:100px;">Remarks</th>
											  	<th style="color: black; max-width:100px;">Requestor Id</th>
											  	<th style="color: black; max-width:200px;">Requestor Emp Name</th>
											  	<th style="color: black; max-width:200px;">Status</th>
										    </tr>
										  </thead>
										  <tbody class="">

										<?php

										$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
												SELECT DISTINCT
													T0.DocEntry,
													T0.DocNum,
													T0.ObjType,
													T0.DocTotal,
													T0.Comments,
													T1.Code,
													T2.TemplateCode,
													T1.EmpId,
													T1.EmpName,
													T0.U_ApprovalCodes
												FROM [".$MSSQL_DB."].[dbo].ODRF T0
												INNER JOIN [".$MSSQL_DB2."].[dbo].[@APR1] T1 ON T0.OwnerCode = T1.EmpId
												INNER JOIN [".$MSSQL_DB2."].[dbo].[@APR2] T2 ON T1.Code = T2.Code
												INNER JOIN [".$MSSQL_DB2."].[dbo].[@OAPT] T3 ON T2.TemplateCode = T3.Code
												INNER JOIN [".$MSSQL_DB2."].[dbo].[@APT1] T4 ON T3.Code = T4.Code
												INNER JOIN [".$MSSQL_DB2."].[dbo].[@OAPR] T5 ON T1.Code = T5.Code
											
												WHERE T4.EmpId = $EmpId AND T0.U_ApprovalCodes != ''
												".$statusWhere."
																					
																					");
													
										$ctr=1;

										while (odbc_fetch_row($qry)) 
										{
											$DocEntry = odbc_result($qry, "DocEntry");
											$ObjType = odbc_result($qry, "ObjType");
											$DocTotal = number_format(odbc_result($qry, "DocTotal"),2);
											$EmpId = odbc_result($qry, "EmpId");
											$EmpName = odbc_result($qry, "EmpName");
											$Comments = odbc_result($qry, "Comments");
											$U_ApprovalCodes = odbc_result($qry, "U_ApprovalCodes");
											$Status = '';
											$background = '';
											if($U_ApprovalCodes != '' && $U_ApprovalCodes == 'Approved'){
												$Status = 'Approved';
												$background = '#90ee90';

											}
											else if($U_ApprovalCodes != '' && $U_ApprovalCodes != 'Rejected' && $U_ApprovalCodes != 'Approved'){
												$Status = 'Pending';
												$background = '#FFFFA7';
											}
											else if($U_ApprovalCodes != '' && $U_ApprovalCodes == 'Rejected'){
												$Status = 'Rejected';
												$background = '#FF7F7F';
											}
											



											echo  '<tr style="background-color: white; "  >
												 		<td class="rowno text-right" style="background-color: lightgray;color:black; font-size:13px;">
															<span>'.$ctr.'</span>
											 			</td>
												    <td class="item-1">
															'.$DocEntry.'
												  	</td>
													  <td class="item-2">
															'.$ObjType.'
													  </td>
													  <td class="text-right" >
															'.$DocTotal.'
													  </td>
													  <td >
															'.$Comments.'
													  </td>
													  <td >
															'.$EmpId.'
													  </td>
													  <td >
															'.$EmpName.'
													  </td>
													  <td style="background-color: '.$background.'">
															'.$Status.'
													  </td>
										    	</tr>';
										     $ctr++;       
										}
										odbc_free_result($qry);
										odbc_close($MSSQL_CONN);


										?>
										   
										  </tbody>
										</table>
</div>

<script>$('#tblForApproval').dataTable({"bLengthChange": false,});</script>