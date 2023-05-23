<?php
session_start();
include_once('../../../config/config.php');
?>

<div class="">
<table id="tblAttachment" class="table table-striped table-bordered table-sm detailsTable col-md-6" cellspacing="0"  style="background-color: white; width: 100%;" cellspacing="0">
  <thead   style="border-bottom: 0 !important">
    <tr>
		  <th class="text-right" style=" color: black">#</th>
			<th style="color: black; min-width:300px; ">Target Path</th>
			<th style="color: black; min-width:500px;" >File Name</th>
			<th style="color: black; min-width:200px;">Attachment Date</th>
			<th style="color: black; min-width:200px;">Free text</th>
    </tr>
  </thead>
  <tbody class="">
    <tr style="background-color: white; ">
		 	<td class="rowno text-right" style="background-color: lightgray;color:black; font-size:13px;">
				<span>1</span>
				<ul class="dropdown-menu rowfunctions" role="menu" style="background-color: #fdfd96;">
					<li class="deleterow" style="font-size:20px; color: black; font-weight:bold">Delete Row</a></li>
					<li class="duplicaterow"style="font-size:20px; color: black; font-weight:bold">Duplicate Row</a></li>
				</ul>
		  </td>
	     <td >
				<div class="input-group " >
					<input type="text" class="form-control matrix-cell targetpath"  aria-label="File Name" aria-describedby="button-addon2" style="outline: none; border:none" readonly />
					
				</div>
		  </td>
		  <td >
				<div class="input-group ">
					<input type='file' id="getFile" name="file" class="form-control matrix-cell filesname"  aria-label="File Name" aria-describedby="button-addon2" style="outline: none; border:none" readonly/>
				</div>
		  </td>
		  <td >
		  	<div class="input-group ">
				<input type="date" id="txtAttachmentDate" value="2023-05-15" min="01-01-2018" max="12-31-2050" class="form-control matrix-cell attachmentdate"  aria-label="Recipient's username" aria-describedby="button-addon2" style="outline: none; border:none" readonly/>	
			</div>
		  </td>
		  <td>
				<div class="input-group ">
					<input type="text" class="form-control matrix-cell freetext" aria-label="Recipient's username" aria-describedby="button-addon2" style="outline: none; border:none;" readonly/>
				</div>
		  </td>
    </tr>
  </tbody>
  <tfoot style="z-index: 999;  background-color: lightgray; " class="d-none">
		<tr style="background-color: lightgray; z-index: 999">
      <th class="text-right" style=" color: black">#</th>
			<th style="color: black; min-width:300px; ">Target Path</th>
			<th style="color: black; min-width:500px;" >File Name</th>
			<th style="color: black; min-width:200px;">Attachment Date</th>
			<th style="color: black; min-width:200px;">Free text</th>
		</tr>
	</tfoot>
</table>
	
	<!-- <div class="col-xl-12 col-lg-3 col-md-3 col-sm-3 py-2 text-right">
		<button id="browseButton" style="color: black;width:250px; font-weight: bold; background: linear-gradient(to bottom, #FCF6BA, #BF953F);">Browse</button>
		<input type='file' id="getFile" name="file" class="d-none">
	</div> -->



	
	
</div>










