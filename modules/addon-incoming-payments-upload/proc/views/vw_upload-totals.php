<?php 
session_start();
include('../../../../config/config.php');



	$err = 0;
	$errmsg = '';
	$ItemCode = '';

	$html = '';
	$highlight = '';

	$openbalance = $_POST['openbalance'];
	$totalcommission = $_POST['totalcommission'];
	$deductions = $_POST['deductions'];
	$platform = $_POST['platform'];
	$wastage = $_POST['wastage'];
	$adjustments = $_POST['adjustments'];
	$merchant = $_POST['merchant'];
	$vat = $_POST['vat'];
	$ewt= $_POST['ewt'];
	$overpayment= $_POST['overpayment'];
	$ordervalue= $_POST['ordervalue'];
	$unapplied= $_POST['unapplied'];

	$openbalance = $openbalance != '' ? $openbalance : 0;
	$totalcommission = $totalcommission != '' ? $totalcommission : 0;
	$deductions = $deductions != '' ? $deductions : 0;
	$platform = $platform != '' ? $platform : 0;
	$wastage = $wastage != '' ? $wastage : 0;
	$adjustments = $adjustments != '' ? $adjustments : 0;
	$merchant = $merchant != '' ? $merchant : 0;
	$vat = $vat != '' ? $vat : 0;
	$ewt = $ewt != '' ? $ewt : 0;
	$overpayment = $overpayment != '' ? $overpayment : 0;
	$ordervalue = $ordervalue != '' ? $ordervalue : 0;
	$unapplied = $unapplied != '' ? $unapplied : 0;
	
	
					$html =
					'<tr style="padding: 0px !important; margin: 0px !important;background-color: lightgray;" >
					  <td class="rowno text-right" style="background-color: lightgray;color:black;">
						<span></span>
					  </td>
				      <td >
							<input type="text" class="form-control bplid d-none"  aria-label=" aria-describedby="button-addon2" style="outline: none; border:none; " readonly value="Total"/>
							<input type="text" class="form-control bplname"  aria-label=" aria-describedby="button-addon2" style="outline: none; border:none; " readonly value="Total"/>
					  </td>
					
					  <td >
							<input type="text" class="form-control matrix-cell docnum"  style="outline: none; border:none" readonly value=""/>
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell cardcode"  aria-label=" aria-describedby="button-addon2" style="outline: none; border:none" readonly value=""/>
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right cardname"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/  >
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right referenceno"   style="outline: none; border:none" maxlength="8" readonly value=""/>
						
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right postingdate"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/ value="">
					  </td>
					   <td >
							<input type="text" class="form-control matrix-cell text-right duedate"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/ value="">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right openbalance"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none; font-weight:bold !important" maxlength="12" readonly/ value="'. number_format($openbalance,2) .'">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right deductionstotal amt"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/ value="'. number_format($totalcommission,2).'">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right totalcommissiontotal amt"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/ value="'. number_format($deductions,2) .'">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right platformtotal amt"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/ value="'. number_format($platform,2) .'">
					  </td>
					   <td >
							<input type="text" class="form-control matrix-cell text-right wastagetotal amt"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/ value="'. number_format($wastage,2) .'">
					  </td>
					    <td >
							<input type="text" class="form-control matrix-cell text-right adjustmentstotal amt"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/ value="'. number_format($adjustments,2) .'">
					  </td>
					    <td >
							<input type="text" class="form-control matrix-cell text-right merchanttotal amt"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/ value="'. number_format($merchant,2) .'">
					  </td>
					    <td >
							<input type="text" class="form-control matrix-cell text-right vat amt"    aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/ value="'. number_format($vat,2) .'">
					  </td>
					   <td >
							<input type="text" class="form-control matrix-cell text-right ewt amt"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/ value="'. number_format($ewt,2) .'">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right  overpayment amt"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/ value="'. number_format($overpayment,2) .'">
					  </td>

					    <td >
							<input type="text" class="form-control matrix-cell text-right  ordervalue amt"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/ value="'. number_format($ordervalue,2) .'">
					  </td>
					      <td >
							<input type="text" class="form-control matrix-cell text-right  unapplied amt"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/ value="'. number_format($unapplied,2) .'">
					  </td>
					   
					</tr>';
			
				
			
				
		
	
	
	if ($err == 0) 
	{
		$data = array("valid"=>true, 
						"msg"=>"Operation completed successfully.",
						"html"=>$html
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
	