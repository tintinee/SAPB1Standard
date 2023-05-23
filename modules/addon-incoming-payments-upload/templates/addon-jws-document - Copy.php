<?php

	include '../../head.php' ;

?>

  <!-- Page Wrapper -->
  <div id="wrapper">
	<?php
	include '../../sidebar.php';
	
	
	$UserId = $_SESSION['SESS_USERID'];
	$UserCode = $_SESSION['SESS_USERCODE'];
	$UserName = $_SESSION['SESS_NAME'];
	?>

<?php
	$AddOnTransOut = array(
		"cardType" => "S",
		"taxCodeCategory" => "I",
		"mainFileName" => "addon-jws",
		"titleName" => "JWS Uploader",
		"toObjectType" => 18,
		"toObjectTableName" => 'A/P Invoice',
		"toChildTable1" => 'PCH1',
	);

	$_SESSION['AddOnTransOut'] = json_encode($AddOnTransOut);

	$_SESSION['mainFileName'] = $AddOnTransOut['mainFileName'];
	$_SESSION['titleName'] = $AddOnTransOut['titleName'];
?>

	<script type="text/javascript">
		let obj = JSON.parse('<?php echo $_SESSION['AddOnTransOut']; ?>');

		sessionStorage.clear();

		sessionStorage.setItem('SAPDateFormat', '<?php echo $_SESSION['SAPDateFormat']; ?>');
		sessionStorage.setItem('mainFileName', obj.mainFileName);
		sessionStorage.setItem('toObjectType', obj.toObjectType);
		sessionStorage.setItem('titleName', obj.titleName);
		sessionStorage.setItem('cardType', obj.cardType);
		sessionStorage.setItem('toObjectTableName', obj.toObjectTableName);
		sessionStorage.setItem('toChildTable1', obj.toChildTable1);
	</script>


    <!-- Content Wrapper -->
    <div id="content-wrapper" class="d-flex flex-column">

      <!-- Main Content -->
      <div id="content" style="background-color: white;">

       <?php
		include '../../topbar.php';
	   ?>
	    <!-- Begin Page Content -->
        <div class="container-fluid" style="margin-left: 1px !important; padding-left: 1px !important;">
          <!-- Page Heading -->
         

          <!-- DataTales Example -->
          <div class="card shadow mb-4"  id="windowmain" style="background-color:#E8E8E8 !important; border: none !important" >
		  <div class="row pr-0 "  width="100%">
			<div class="col-lg-12" id="containerSystem" style="margin-right: 0px !important; padding-right: 0px !important; "  >
            <div class="card-header py-0" style="background-color: #A8A8A8; border-bottom-width: thick; border-color: #f0ad4e;">
				<div class="row">
					<div class="col-lg-6 col-md-6 col-sm-6">
						<h5 class="mt-2 font-weight-bold " style="color: black;"><?php echo $_SESSION['titleName']; ?></h5>
					</div>

				</div>
            </div>
            <div class="card-body " id="window" style="background-color: #F5F5F5; border-right: 1px solid #A0A0A0">
		<form class="user responsive " id="form"  width="100%">
			<div class="row pr-0 pb-2"  width="100%">
				<div class="col-4">
					<div class="row">
						<div class="col-12">
							<div class="form-group row d-flex align-items-center py-0 my-0" >
								<div class="col-sm-2" >
									<label for="txtFiletoUpload" class=" col-form-label " style="color: black;" >File to Upload</label>
								</div>
								<div class="col-sm-9" >
									<div class="row">
										<div class="col-10">
											<div class="input-group mb-1">
												<input readonly type="text" id="txtFiletoUpload" class="form-control" placeholder="" aria-label="Username" aria-describedby="basic-addon1 " style="border-bottom-left-radius:5px; border-top-left-radius:5px;">
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="col-12">
							<div class="form-group row d-flex align-items-center py-0 my-0" >
								<div class="col-sm-2" >
									<label for="txtBranch" class=" col-form-label " style="color: black;" >Branch</label>
								</div>
								<div class="col-sm-9" >
									<div class="row d-flex align-items-center">
										<div class="col-10">
											<div class="input-group mb-1">
												<select id="selBranchName" class="fs-1 w-100 form-control-sm mdb-select md-form" searchable="Search here.." style=" !important;outline:none; border-color: #D0D0D0; font-size: 17px;">
													<optgroup>
														<option value="" disabled selected>Select Branch</option>
														<?php 
															$qry = odbc_exec($MSSQL_CONN, "USE [".$MSSQL_DB."];
																SELECT BPLId, BPLName FROM OBPL ORDER BY BPLId ASC
															");

															while (odbc_fetch_row($qry)) 
															{
																echo '<option value="'.odbc_result($qry, 'BPLId').'" >'.odbc_result($qry, 'BPLName').'</option>';
															}
														?>
													</optgroup>
												</select>
											</div>
										</div>
										<div class="col-2 p-0">
											<span id="txtDetected" class="d-none">(DETECTED)</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
									
				</div>

				<div class="col-4">
					<div class="row">
						<div class="col-12">
							<div class="form-group row d-flex align-items-center py-0 my-0" >
								<div class="col-5" >
									<label for="txtFileReportValidation" class="col-form-label " style="color: black;" >File/Report Format Validation</label>
								</div>
								<div class="col-7" >
									<div class="row">
										<div class="col-10">
											<div class="input-group mb-1">
												<input readonly type="text" id="txtFileReportValidation" class="form-control" placeholder="" aria-label="Username" aria-describedby="basic-addon1 " style="border-bottom-left-radius:5px; border-top-left-radius:5px; text-align: center;">
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="col-3 ml-auto">
					<div class="row form-group justify-content-center">
						<div class="col-5">
							<button type="button" id="btnBrowse" class="  btn btn-warning btn-rounded " style="color: black; font-weight: bold; width:100%; background: linear-gradient(to bottom, #FCF6BA, #BF953F);">Browse</button>
							<input class="d-none" type="file" id="chooseFile" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">
						</div>
						<div class="col-5">
							<button type="button" id="btnUpload" class="  btn btn-warning btn-rounded " style="color: black; font-weight: bold; width:100%; background: linear-gradient(to bottom, #FCF6BA, #BF953F);" disabled>Upload</button>
						</div>
					</div>
				</div>
			</div>

			<div class="row d-flex align-items-center mt-5">
				<div id="loadingDiv" class="col-12 p-0 d-none" style="position: relative; margin: 0px 0px 0px 0px; background-color: lightgrey;">
					<div id="loadingBar" style="z-index:-1; width: 0%; height: 20px; background-color: green;">
						<div class="row d-flex align-items-center text-center" style="z-index:100; position: absolute; font-weight: bold; color: white; width: 100%; height: 20px; background-color: transparent;">
							<h5 id="loadingText" style="font-weight: bold; width: 100%; color: white; margin: auto;" ></h5>		
						</div>	
					</div>
				</div>
				<div id="uploadResult" class="col-12 d-none" style="width: 100%; min-height: 0px; max-height: 800px;  overflow: auto; margin: 0px;">
					<table id="tblUploadResult" class="table-hover" style="border-collapse: separate;">
						<thead style="position: sticky; top: 0px;">
							<tr>
							</tr>
						</thead>
						<tbody>
							
						</tbody>
					</table>
				</div>
			</div>
				
			<div  id="footerButtons" class="form-group row  mt-5 ">
				<div class="col-lg-6 col-md-6 col-sm-6 text-left">
					<button type="button" id="btnPost" class="  btn btn-warning btn-rounded " style="color: black; font-weight: bold; width:250px; background: linear-gradient(to bottom, #FCF6BA, #BF953F);" disabled>Post</button>
					
					<button type="button" id="btnCancel" class=" btn btn-warning btn-rounded ml-5" style="color: black;width:250px; font-weight: bold; background: linear-gradient(to bottom, #FCF6BA, #BF953F);">Cancel</button>
				</div>
			</div>
		</form>
  </div>
  <!-- End of Main Content -->
</div>	
</div>
</div>
</div>
      

    </div>
    <!-- End of Content Wrapper -->

  </div>
  <!-- End of Page Wrapper -->

  <!-- Scroll to Top Button-->
  <a class="scroll-to-top rounded" href="#page-top">
    <i class="fas fa-angle-up"></i>
  </a>


<!--Reusable Prompt Modal-->
    <div class="modal fade " id="promptModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" data-backdrop="false" style="margin-top: 300px !important;">
      <div class="modal-dialog modal-xl" role="document" style="width:100%">
        <!--Content-->
        <div class="modal-content-full-width modal-content">
          <!--Header-->
          <div class="modal-header"  style="background-color: #A8A8A8; border-bottom-width: thick; border-color: #f0ad4e; ">
            <h4 class="modal-title w-100" id="promptTitle" style="color:black; font-size:15px !important;"></h4>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close" >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <!--Body-->
          <div class="modal-body">
          <h6 class="modal-title w-100" id="promptMessage" style="color:black"></h6>
          <br>
          <br>
          <h6 class="modal-title w-100" id="promptInfo" style="color:black"></h6>
          </div>
          <!--Footer-->
          <div class="modal-footer"  style="background-color: none !important;">
						<button id="btnPrompt1" type="button" class="btn btn-secondary" data-dismiss="modal"></button>
            <button id="btnPrompt2" type="button" class="btn btn-secondary" data-dismiss="modal"></button>
          </div>
        </div>
        <!--/.Content-->
      </div>
    </div>
<!--Reusable Prompt Modal--> 

<!-- Logout Modal-->
    <div class="modal fade " id="logoutModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" data-backdrop="false" style="margin-top: 300px !important;">
      <div class="modal-dialog modal-xl" role="document" style="width:100%">
        <!--Content-->
        <div class="modal-content-full-width modal-content">
          <!--Header-->
          <div class="modal-header"  style="background-color: #A8A8A8; border-bottom-width: thick; border-color: #f0ad4e; ">
            <h4 class="modal-title w-100" id="myModalLabel" style="color:black; font-size:15px !important;">Logout</h4>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close" >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <!--Body-->
          <div class="modal-body">
          <h6 class="modal-title w-100" id="myModalLabel" style="color:black">Do you want to logout?</h6>
          </div>
          <!--Footer-->
          <div class="modal-footer"  style="background-color: none !important;">
						<button id="btnLogoutConfirm" type="button" class="btn btn-secondary" data-dismiss="modal">Yes</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">No</button>
          </div>
        </div>
        <!--/.Content-->
      </div>
    </div>
  <!-- Logout Modal --> 
  
  <!-- Loading Modal -->
    <div class="modal fade" id="loadModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" data-backdrop="false" >
      <div class="modal-dialog modal-xl" role="document" style="width:400px !important;" >
        <!--Content-->
        <div class=" modal-content" >
          <!--Header-->
          <div class="modal-header "  style="background-color: #A8A8A8; border-bottom-width: thick; border-color: #f0ad4e;">
          </div>
          <!--Body-->
		
				<div class="text-center  " >
					<div class="row ">	
						<div class="col-12" >
							<img src="../../../img/wait.gif" width=400 height=100 style=" background-color: none !important;margin-top:0px !important">
						</div>	
					</div>	
				</div>	
		
          <!--Footer-->
          <div class="modal-footer"  style="background-color: #A8A8A8; border-bottom-width: thick; border-color: #f0ad4e; padding: 7px !important">
          </div> 
        
        <!--/.Content-->
      </div>
    </div>
	</div>
    <!-- Loading Modal -->

<script src="../script/<?php echo $_SESSION['mainFileName']; ?>.js"></script>
<script></script>

<?php
	include '../../bottom.php' 
?>
