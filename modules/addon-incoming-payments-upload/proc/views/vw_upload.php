<?php 
session_start();
include('../../../../config/config.php');



	$err = 0;
	$errmsg = '';
	$ItemCode = '';

	$html = '';
	$highlight = '';
	
	$filename=$_FILES["txtFile1"]["tmp_name"];		
	
	if($_FILES["txtFile1"]["size"] > 0)
	{
		$file = fopen($filename, "r");
		$ctr = 1;
		
		$find_header = 0;
		while (($getData = fgetcsv($file, 10000, ",")) !== FALSE)
		{
			if($find_header != 0)
			{
				
				
				// Branch 0
				// Branch Name 1
				// Document No.	2
				// Customer Code 3	
				// Customer Name 4
				// Reference No. 5	
				// Posting Date 6	
				// Due Date 7	
				// Open Balance 8	
				// Deductions 9	
				// Total Commissions 10
				// Platform Fees 11	
				// Wastage 12	
				// Adjustments 13	
				// Merchant 14
				// VAT	15
				// EWT 16
				if($getData[0] != 'Total'){
				$bplId = $getData[0];
				$branchCode = $getData[1];
				$cardCode = $getData[3];
				$cardName = $getData[4];

			

				$html .=
					'<tr style="padding: 0px !important; margin: 0px !important;background-color: lightgray;" >
					  <td class="rowno text-right" style="background-color: lightgray;color:black;">
						<span>'.$ctr.'</span>
					  </td>
				      <td >
							<input type="text" class="form-control bplid d-none"  aria-label=" aria-describedby="button-addon2" style="outline: none; border:none; " readonly value="'. $getData[0] .'"/>
							<input type="text" class="form-control bplname"  aria-label=" aria-describedby="button-addon2" style="outline: none; border:none; " readonly value="'. $getData[1] .'"/>
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell docnum"  style="outline: none; border:none" readonly value="'. $getData[2] .'"/>
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell cardcode"  aria-label=" aria-describedby="button-addon2" style="outline: none; border:none" readonly value="'. $getData[3] .'"/>
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right cardname"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/  value="'. $getData[4] .'">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right referenceno"   style="outline: none; border:none" maxlength="8" readonly value="'. $getData[5] .'"/>
						
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right postingdate"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[6] .'">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right duedate"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[7] .'">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right openbalance"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[8] .'">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right totalcommission"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[9] .'">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right deductions"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[10] .'">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right platform"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[11] .'">
					  </td>
					   <td >
							<input type="text" class="form-control matrix-cell text-right wastage"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[12] .'">
					  </td>
					    <td >
							<input type="text" class="form-control matrix-cell text-right adjustments"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[13] .'">
					  </td>
					    <td >
							<input type="text" class="form-control matrix-cell text-right merchant"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[14] .'">
					  </td>
					    <td >
							<input type="text" class="form-control matrix-cell text-right vat"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[15] .'">
					  </td>
					   <td >
							<input type="text" class="form-control matrix-cell text-right ewt"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[16] .'">
					  </td>
					   <td >
							<input type="text" class="form-control matrix-cell text-right overpayment"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[17] .'">
					  </td>
					     <td >
							<input type="text" class="form-control matrix-cell text-right ordervalue"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[18] .'">
					  </td>
					     <td >
							<input type="text" class="form-control matrix-cell text-right unapplied"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[19] .'">
					  </td>

					   
					</tr>'
					;
				}
				else{
					$getData[8] = $getData[8] != '' ? $getData[8] : 0.00;
					$getData[9] = $getData[9] != '' ? $getData[9] : 0.00;
					$getData[10] = $getData[10] != '' ? $getData[10] : 0.00;
					$getData[11] = $getData[11] != '' ? $getData[11] : 0.00;
					$getData[12] = $getData[12] != '' ? $getData[12] : 0.00;
					$getData[13] = $getData[13] != '' ? $getData[13] : 0.00;
					$getData[14] = $getData[14] != '' ? $getData[14] : 0.00;
					$getData[15] = $getData[15] != '' ? $getData[15] : 0.00;
					$getData[16] = $getData[16] != '' ? $getData[16] : 0.00;
					$getData[17] = $getData[17] != '' ? $getData[17] : 0.00;
					$getData[18] = $getData[18] != '' ? $getData[18] : 0.00;
					$getData[19] = $getData[19] != '' ? $getData[19] : 0.00;

					$html .=
					'<tr style="padding: 0px !important; margin: 0px !important;background-color: lightgray;" >
					  <td class="rowno text-right" style="background-color: lightgray;color:black;">
						<span>'.$ctr.'</span>
					  </td>
				      <td >
							<input type="text" class="form-control bplid d-none"  aria-label=" aria-describedby="button-addon2" style="outline: none; border:none; " readonly value="'. $getData[0] .'"/>
							<input type="text" class="form-control bplname"  aria-label=" aria-describedby="button-addon2" style="outline: none; border:none; " readonly value="'. $getData[1] .'"/>
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell docnum"  style="outline: none; border:none" readonly value="'. $getData[2] .'"/>
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell cardcode"  aria-label=" aria-describedby="button-addon2" style="outline: none; border:none" readonly value="'. $getData[3] .'"/>
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right cardname"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly/  value="'. $getData[4] .'">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right referenceno"   style="outline: none; border:none" maxlength="8" readonly value="'. $getData[5] .'"/>
						
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right postingdate"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[6] .'">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right duedate"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[7] .'">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right openbalance"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[8] .'">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right totalcommission"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[9] .'">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right deductions"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[10] .'">
					  </td>
					  <td >
							<input type="text" class="form-control matrix-cell text-right platform"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[11] .'">
					  </td>
					   <td >
							<input type="text" class="form-control matrix-cell text-right wastage"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[12] .'">
					  </td>
					    <td >
							<input type="text" class="form-control matrix-cell text-right adjustments"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[13] .'">
					  </td>
					    <td >
							<input type="text" class="form-control matrix-cell text-right merchant"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[14] .'">
					  </td>
					    <td >
							<input type="text" class="form-control matrix-cell text-right vat"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[15] .'">
					  </td>
					   <td >
							<input type="text" class="form-control matrix-cell text-right ewt"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[16] .'">
					  </td>
					   <td >
							<input type="text" class="form-control matrix-cell text-right overpayment"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[17] .'">
					  </td>
					     <td >
							<input type="text" class="form-control matrix-cell text-right ordervalue"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[18] .'">
					  </td>
					       <td >
							<input type="text" class="form-control matrix-cell text-right unapplied"   aria-label="" aria-describedby="button-addon2" style="outline: none; border:none" maxlength="12" readonly value="'. $getData[19] .'">
					  </td>
					   
					</tr>';
				}	
				
			
					$ctr += 1;
				
				
				
			 }
			$find_header++;
		}
		
		fclose($file);	
	}
	
	if ($err == 0) 
	{
		$data = array("valid"=>true, 
						"msg"=>"Operation completed successfully.",
						"html"=>$html,
						"bplId"=>$bplId,
						"branchCode"=>$branchCode,
						"cardCode"=>$cardCode,
						"cardName"=>$cardName,);
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
	