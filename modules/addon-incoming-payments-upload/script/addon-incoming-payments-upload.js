
$(document).ready(function () {

const mainFileName = sessionStorage.mainFileName;
const titleName = sessionStorage.titleName;
const toObjectType = parseInt(sessionStorage.toObjectType);
const SAPDateFormat = sessionStorage.SAPDateFormat;
const cardType = sessionStorage.cardType;
const toObjectTableName = sessionStorage.toObjectTableName;
const toChildTable1 = sessionStorage.toChildTable1;
const toCardCode1 = sessionStorage.toCardCode1;
const toCardName1 = sessionStorage.toCardName1;
const toCardCode2 = sessionStorage.toCardCode2;
const toCardName2 = sessionStorage.toCardName2;
const toObjectType1 = sessionStorage.toObjectType1;
const fromBaseType1 = sessionStorage.fromBaseType1;
const toObjectType2 = sessionStorage.toObjectType2;
const fromBaseType2 = sessionStorage.fromBaseType2;
const onProd = '';
const objSession = '';
const serverIP = '';

sessionStorage.clear();

let toCardCode = '', toCardName = '';
let lineErrors = 0;
let lineCount;
let validLineArr;
let SAPObjArr = [];
let responseObj;
let isPosting = false;
let detailLineCount = 0;
let dataTableObj = {};
let excelHeadersObj = {
	nonTrade: [
		'Customer Code',
		'Store Name',
		'Billing Number',
		'Billing Date',
		'Product',
		'Item Code',
		'Qty',
		'Total',
		'VAT'
	],
	trade: [
		'Customer Code',
		'Store Name',
		'Billing Number',
		'wf #',
		'Sales Order',
		'DR Number',
		'Billing Date',
		'Product',
		'Item Code',
		'UOM',
		'Qty',
		'Total',
		'VAT'
	]
};

let tableHeadersObj = {
	nonTrade: [
		'#',
    	'Vendor Name', 
    	'Billing No.', 
    	'Posting Date',
    	'Item Code', 
		'WT Liable',
    	'WT Code',
		'WT Amount',
    	'Item Details', 
    	'Item Name',
    	'Total Amount Due',
    	'Message',
    	'Status'
    ],
	trade: [
		'#',
		'Vendor Name',
		'Sales Order',
		'Reference No.',
		'Billing No.',
		'Posting Date',
		'Item Code',
		'Item Name',
		'Quantity',
		'Gross Total',
		'WT Liable',
		'WT Code',
		'WT Amount',
		'Remarks',
		'Message',
		'Status'
	]
};

let excelHeaders, tableHeaders;
let reportType;
let taxRate = 0.00, 
	isWtEnabled = false, 
	isNonTradeType = true,
	nonTradeEWTArr = [];


$('#txtPostingDate').trigger('change');
$('#txtTransferDate').trigger('change');

$('input, a, button, ul, select').click(function(e){
	if (isPosting){
		e.preventDefault();
		promptMessage1Button('Warning', 'Please wait for the posting process to complete', 'OK');
		return false;
	}
});

$(document.body).on('click', '#btnBrowse', function(){
	//$("#chooseFile").val('');
	//$("#chooseFile").trigger('click');
	$("#txtFile1").trigger('click');
	
});
$(document.body).on('change', '#txtFile1', function(){
		
		let file = $("#txtFile1").val();
		let fileTrimmed = file.substr(0, file.indexOf('h')); 
		
		$("#txtFiletoUpload").val(file);
		$('#btnUpload3').removeAttr('disabled');
});	
$(document.body).on('change', '#chooseFile', function(){
	$('#txtFiletoUpload').val($(this)[0].files[0].name);
	resetState(false);
	$('#btnUpload').removeAttr('disabled');
	$('#txtFiletoUpload').attr('title', $(this)[0].files[0].name);

	promptMessage2Buttons2ReturnBools('Report Type', 'What is the report type of the selected file?', 'Non-trade', 'Trade', setReportType);

	function setReportType(bool) {
		isNonTradeType = bool;
	}
});
$(document.body).on('change', '#txtPostingDate', function () 
	{
		$('#txtPostingDate2').val(SAPDateFormater($(this).val()).value);
		
	});
$(document.body).on('change', '#txtTransferDate', function () 
	{
		$('#txtTransferDate2').val(SAPDateFormater($(this).val()).value);
		
	});

$(document.body).on('blur', '#txtPostingDate2', function(){
	if ($(this).val() == '')
		return false;

	let currentVal = $(this).val();

	let dateObj = SAPDateFormater($(this).val(), true);
	if (dateObj.bool) {
		$(this).val(dateObj.value);
		$('#txtPostingDate').val(SQLDateFormater($(this).val()))
	} else {
		$(this).val('');
		portalMessage(dateObj.error, 'red', 'white');
	}
})
$(document.body).on('blur', '#txtTransferDate2', function(){
	if ($(this).val() == '')
		return false;

	let currentVal = $(this).val();

	let dateObj = SAPDateFormater($(this).val(), true);
	if (dateObj.bool) {
		$(this).val(dateObj.value);
		$('#txtTransferDate').val(SQLDateFormater($(this).val()))
	} else {
		$(this).val('');
		portalMessage(dateObj.error, 'red', 'white');
	}
})



$(document.body).on('change', '.wtCode .selWtCode', async function(){
	dataTableObj.detailLines = dataTableObj.detailLines.map(lineObj => {
		lineObj.lines = lineObj.lines.map(line => {
			if (line.lineNo == $(this).attr('id2')) {
				line.wTax.code = $(this).find('option:selected').text();
				line.wTax.account = $(this).find('option:selected').attr('account');
				line.wTax.rate = Number($(this).val());

				let wtRate = Number($(this).val());
				let total = reportType === 'trade' ? 
					Number($(this).parent().siblings('td.grossTotal').attr('floatVal'))
					:
					Number($(this).parent().siblings('td.totalAmountDue').attr('floatVal'));
				let totalBeforeVat = total/(1 + taxRate);
				let wtAmount = totalBeforeVat * wtRate;

				line.wTax.amount = wtAmount;
				if ($(this).parent().siblings('td.wtAmount').text() !== '')
					$(this).parent().siblings('td.wtAmount').text(FormatMoney(wtAmount));
			}
			return line;
		})
		return lineObj;
	})

	await lineObjsToSAPObjs(dataTableObj, $('#btnPost')).then(res => SAPObjArr = res);

});

$(document.body).on('change', '.selWtLiable', async function(){
	let wtCode = $(this).parent().siblings('td.wtCode').find('select.selWtCode');
	if ($(this).val() === 'N') {
		$(this).parent().siblings('td.wtAmount').text('');
		wtCode.addClass('d-none');
		dataTableObj.detailLines = dataTableObj.detailLines.map(lineObj => {
			lineObj.lines = lineObj.lines.map(line => {
				if (line.lineNo == $(this).attr('id2')) {
					line.wTax.liable = 'N';
				}
				return line
			})
			return lineObj;
		})
	} else {
		wtCode.removeClass('d-none');
		let wtRate = Number(wtCode.val());
		let total = reportType === 'trade' ? 
			Number($(this).parent().siblings('td.grossTotal').attr('floatVal'))
			:
			Number($(this).parent().siblings('td.totalAmountDue').attr('floatVal'));
		let totalBeforeVat = total/(1 + taxRate);
		let wtAmount = totalBeforeVat * wtRate;
		$(this).parent().siblings('td.wtAmount').text(FormatMoney(wtAmount));
		dataTableObj.detailLines = dataTableObj.detailLines.map(lineObj => {
			lineObj.lines = lineObj.lines.map(line => {
				if (line.lineNo == $(this).attr('id2')) {
					line.wTax.liable = 'Y';
				}
				return line
			})
			return lineObj;
		})
	}

	await lineObjsToSAPObjs(dataTableObj, $('#btnPost')).then(res => SAPObjArr = res);

});

$(document.body).on('change', '#selBranchName', async function(){
	$('#btnPost').attr('disabled', true)
	$("#countDisplay").addClass('d-none');

	if (!$('#txtDetected').hasClass('d-none')) {
		$('#txtDetected').addClass('d-none');
	}

	$("#btnExcelDownload").parent().addClass('d-none');
	$("#btnExcelDownload").text('Preparing Excel file to download...');
	$("#btnExcelDownload").attr('disabled');

	showLoadingBar();
	loadingBar(100, 100, 'Please wait... Revalidating each transaction...', true);

	$('#uploadResult').addClass('d-none');

	let resObj = await objValidation('dataObj-lines', dataTableObj);
    let validatedLines = resObj.lineObjArr;
    dataTableObj = resObj.dataObj;

    if (!validatedLines.length)
    	return false;

	lineErrors = 0;
    $('#tblUploadResult > tbody').find('tr').each(async function(i){
    	$(this).find('td.message, td.status').removeClass('text-danger text-success text-primary');
    	$(this).find('td.quantity').removeClass('text-primary');
    	$(this).find('td.quantity').removeAttr('title');

    	if (validatedLines[i].error) {
    		$(this).find('td.message').html(validatedLines[i].message);
    		$(this).find('td.message').addClass('text-danger');
    		$(this).find('td.status').text('FAILED');
    		$(this).find('td.status').addClass('text-danger');
    		lineErrors++;
    	} else {
    		if (validatedLines[i].message === 'No errors found')
    			$(this).find('td.message').text(validatedLines[i].message);
    		else {
    			$(this).find('td.message').html(validatedLines[i].message);
    			$(this).find('td.message').addClass('text-primary');
    		}
    		$(this).find('td.status').text('SUCCESS');
	    	$(this).find('td.status').addClass('text-success');
    	}
    	if (validatedLines[i].uoMCodeToUse !== '' && (validatedLines[i].givenUoMCode !== 'ST')) {

    		$(this).find('td.unit').text(validatedLines[i].uoMCodeToUse);
    		$(this).find('td.unit').attr('title', 'Found UoMCode in the raw file is '+validatedLines[i].givenUoMCode)
    		$(this).find('td.unit').addClass('text-primary');

    		let arr = validatedLines[i].text.replaceAll(' ', '').split(',');
			let conversionFactor = isNaN(parseInt(arr[arr.length - 1])) ? 1 : parseInt(arr[arr.length - 1]);

    		if (conversionFactor > 1) {
    			$(this).find('td.quantity').text(validatedLines[i].quantity * conversionFactor);
    			$(this).find('td.cost').text(FormatMoney(validatedLines[i].amount/(validatedLines[i].quantity * conversionFactor)));
    			$(this).find('td.message').html($(this).find('td.message').html()+'<br>Quantity and Cost have been converted<br>based on the SAP default UoM.');
	    		$(this).find('td.quantity').attr('title', 'Found UoMCode and quantity in the raw file are '+validatedLines[i].givenUoMCode+' and '+validatedLines[i].quantity+', respectively.')
	    		$(this).find('td.quantity, td.cost').addClass('text-primary');

	    		dataTableObj.detailLines = dataTableObj.detailLines.map(lineObj => {
					lineObj.lines = lineObj.lines.map(line => {
						if (line.lineNo == i + 1) {
							line.conversionFactor = conversionFactor;
						}
						return line
					})
					return lineObj;
				})

    		} else {
	    		$(this).find('td.quantity').attr('title', 'Found UoMCode and quantity in the raw file are '+validatedLines[i].givenUoMCode+' and '+validatedLines[i].quantity+', respectively.')
    			$(this).find('td.message').html('Cannot convert quantity');
    			$(this).find('td.message').addClass('text-danger');
	    		$(this).find('td.quantity').addClass('text-danger');
	    		$(this).find('td.status').text('FAILED');
    			$(this).find('td.status').addClass('text-danger');

	    		dataTableObj.detailLines = dataTableObj.detailLines.map(lineObj => {
					lineObj.lines = lineObj.lines.map(line => {
						if (line.lineNo == i + 1) {
							line.error = true;
						}
						return line
					})
					return lineObj;
				})
    		}

    	}
    });

    let colSetting = await $('#tblUploadResult th, #tblUploadResult td').css('white-space', 'nowrap');

    if (!$.fn.DataTable.isDataTable('#tblUploadResult')) {
	 	//$('#tblUploadResult').DataTable().destroy();
	 	$('#tblUploadResult').dataTable({
	 		destroy: true,
	    	searching: true,
	    	paging: false, 
	    	info: false,
	    });
	}

	await lineObjsToSAPObjs(dataTableObj, $('#btnPost')).then(res => SAPObjArr = res);

    $('#uploadResult').removeClass('d-none');
    hideLoadingBar();

    $("#btnExcelDownload").parent().removeClass('d-none');

    let rowsArray = [];
    rowsArray.push(tableHeaders);
    let cellsArray = [];
    $('#tblUploadResult > tbody').find('tr').each(function(){
    	cellsArray = [];
    	$(this).find('td').each(function(){
    		if ($(this).has('select').text() === '')
	    			cellsArray.push($(this).text());
	    		else
	    			cellsArray.push($(this).find('select option:selected').text());
    	})
    	rowsArray.push(cellsArray);
    });

    tableToExcel(rowsArray, 'JWS-table');

    $("#allCount").text(dataTableObj.detailLines.length);
	$("#validCount").text(SAPObjArr.length);
	$("#invalidCount").text(dataTableObj.detailLines.length - SAPObjArr.length);
	$("#countDisplay").removeClass('d-none');
});
$(document.body).on('dblclick', '#tblBP tbody > tr', function () 
	{
		
		let cardCode = $(this).children('td.item-1').text();
        let cardName = $(this).children('td.item-2').text();
		let contactPerson = $(this).children('td.item-4').text();
		let paymentTermsCode = $(this).children('td.item-5').text();
		let paymentTermsName = $(this).children('td.item-6').text();
		let tinNumber = $(this).children('td.item-7').text();
		let contactPersonCode = $(this).children('td.item-8').text();
		txtCurrency = $(this).children('td.item-9').text();
		let addressID = '';
		
     
        $('#bpModal').modal('hide');
	
		$('#txtCardCode').val(cardCode).css({'background-color': '', 'border-radius': '0px'});
		$('#txtCardName').val(cardName).css('background-color', '');
		$('#txtContactPerson').val(contactPerson).css({'background-color': '', 'border-radius': '0px'});
		$('#txtContactPersonCode').val(contactPersonCode);
		$('#txtJournalMemo').val('Outgoing Payments - ' + cardCode);
		$('#txtPaymentTermsCode').val(paymentTermsCode);
		$('#txtPaymentTermsName').val(paymentTermsName);
		$('#txtTinNumber').val(tinNumber);
		$('#selCurrency').val('BP');
		$('#txtCurrency').val(txtCurrency);
			
		$('#lnkCardCode').removeClass('d-none');
		$('#lnkContactPerson').removeClass('d-none');
		$('#contactPersonBtn').removeClass('d-none');
		
		$('#btnShipToDetails').removeClass('d-none');
		$('#btnBillToDetails').removeClass('d-none');
		
		$('#btnCopyFrom').prop('disabled',false);
		
		
		
	
       
    });
  $(document.body).on('dblclick', '#tblGLTransfer tbody > tr', function () 
	{
		
		var glCode = $(this).children('td.item-1').text();
        var glName = $(this).children('td.item-2').text();
	
		
        $('#glModalTransfer').modal('hide');
	
		$('#txtTransferGLCode').val(glCode);
		$('#txtTransferGLName').val(glCode + ' - ' + glName);
       
	  	itemCode = glCode;
		CheckCardCode(itemCode);
    });
//EXCEL UPLOAD
$("#btnUpload3").on("click", function (e) 
	{
			$('#modal-load-init').modal('show');
			
			$('#tblUploadResult tbody').empty();	
			
			var input = document.getElementById("txtFile1");

			let openbalance = 0.00;
			let totalcommission = 0.00;
			let deductions = 0.00;
			let platform = 0.00;
			let wastage = 0.00;
			let adjustments = 0.00;
			let merchant = 0.00;
			let vat = 0.00;
			let ewt = 0.00;
			let overpayment = 0.00;
			let ordervalue = 0.00;
			let unapplied = 0.00;

			file = input.files[0];
			formData= new FormData();
			formData.append("txtFile1", file);
			//formData.append("txtPostingDateFrom", txtPostingDateFrom);
			//formData.append("txtPostingDateTo", txtPostingDateTo);
			
			$.ajax(
			{
				type: 'POST',
				url: '../proc/views/vw_upload.php',
				data: formData,
				contentType:false,
				cache:false,
				processData:false,
				dataType : 'html',
				success: function (data) 
				{
					
					var res = $.parseJSON(data);
					if(res.valid == true)
					{
						
						$('#tblUploadResult tbody').append(res.html);
						
						
						//$('#btnUpload').removeClass('hidden');
						
						populateHeaderFields();
						// alert(res.bplId)
							$('#txtBPLId').val(res.bplId);
							$('#txtBranchCode').val(res.branchCode);
							$('#txtCardCode').val(res.cardCode);
							$('#txtCardName').val(res.cardName);

							wtaxcodegenerate();

						$('#modal-load-init').modal('hide');
					}
					else
					{
						
						//$('#tblUploadResult tbody').append(res.html);
						
						$('#modal-load-init').modal('hide');
					}
				}
			});

			setTimeout(function()
			{
				let newBranch = $('#txtBPLId').val();
				$.ajax(
				{
					type: 'POST',
					url: '../proc/views/vw_cash-account-per-branch.php',
					data: {newBranch : newBranch},
					success: function (data) 
					{
						
						var res = $.parseJSON(data);
						if(res.valid == true)
						{
							
							$('#txtTransferGLCode').val(res.cashAccount);
							
						
							$('#modal-load-init').modal('hide');
						}
						else
						{
							
							
							
							$('#modal-load-init').modal('hide');
						}
					}
				});
			},2000)
			setTimeout(function()
			{
				
				$('#tblUploadResult tbody tr').each(function (i) 
				{
					
					if($(this).find('input.bplname').val() != 'Total' && $(this).find('input').hasClass('openbalance')){
						if($(this).find('input.openbalance').val() != ''){
		            		openbalance = openbalance + parseFloat($(this).find('input.openbalance').val().replace(/,/g,''));
						}
		            }
		            if($(this).find('input.bplname').val() != 'Total' && $(this).find('input').hasClass('totalcommission')){
		            		if($(this).find('input.totalcommission').val() != ''){
		            		totalcommission = totalcommission + parseFloat($(this).find('input.totalcommission').val().replace(/,/g,''));
		            	}
		            }
		            if($(this).find('input.bplname').val() != 'Total' && $(this).find('input').hasClass('deductions')){
		            	if($(this).find('input.deductions').val() != ''){
		            		 deductions = deductions + parseFloat($(this).find('input.deductions').val().replace(/,/g,''));
		            		}
		            }
		            if($(this).find('input.bplname').val() != 'Total' && $(this).find('input').hasClass('platform')){
		            	if($(this).find('input.platform').val() != ''){
		            		platform = platform + parseFloat($(this).find('input.platform').val().replace(/,/g,''));
		            	}
		            }
		            if($(this).find('input.bplname').val() != 'Total' && $(this).find('input').hasClass('wastage')){
		            	if($(this).find('input.wastage').val() != ''){
		            		wastage = wastage + parseFloat($(this).find('input.wastage').val().replace(/,/g,''));
		            	}
		            }
		            if($(this).find('input.bplname').val() != 'Total' && $(this).find('input').hasClass('adjustments')){
		            	if($(this).find('input.adjustments').val() != ''){
		            		adjustments = adjustments + parseFloat($(this).find('input.adjustments').val().replace(/,/g,''));
		            	}
		            }
		            if($(this).find('input.bplname').val() != 'Total' && $(this).find('input').hasClass('merchant')){
		            	if($(this).find('input.merchant').val() != ''){
		            		 merchant = merchant + parseFloat($(this).find('input.merchant').val().replace(/,/g,''));
		            	}
		            }
		            if($(this).find('input.bplname').val() != 'Total' && $(this).find('input').hasClass('vat')){
		            	if($(this).find('input.vat').val() != ''){
		            		vat = vat + parseFloat($(this).find('input.vat').val().replace(/,/g,''));
		            	}
		            }
		            if($(this).find('input.bplname').val() != 'Total' && $(this).find('input').hasClass('ewt')){
		            	if($(this).find('input.ewt').val() != ''){
		            		ewt = ewt + parseFloat($(this).find('input.ewt').val().replace(/,/g,''));
		            	}
		            }
		             if($(this).find('input.bplname').val() != 'Total' && $(this).find('input').hasClass('overpayment')){
		            	if($(this).find('input.overpayment').val() != ''){
		            		overpayment = overpayment + parseFloat($(this).find('input.overpayment').val().replace(/,/g,''));

		            	}
		            }
		              if($(this).find('input.bplname').val() != 'Total' && $(this).find('input').hasClass('ordervalue')){
		            	if($(this).find('input.ordervalue').val() != ''){
		            		ordervalue = ordervalue + parseFloat($(this).find('input.ordervalue').val().replace(/,/g,''));

		            	}
		            }
		            if($(this).find('input.bplname').val() != 'Total' && $(this).find('input').hasClass('unapplied')){
		            	if($(this).find('input.unapplied').val() != ''){
		            		unapplied = unapplied + parseFloat($(this).find('input.unapplied').val().replace(/,/g,''));

		            	}
		            }
		        });


			},1500)
			setTimeout(function()
			{


				$.ajax(
				{
					type: 'POST',
					url: '../proc/views/vw_upload-totals.php',
					data: {
							openbalance : openbalance,
							totalcommission : totalcommission,
							deductions : deductions,
							platform : platform,
							wastage : wastage,
							adjustments : adjustments,
							merchant : merchant,
							vat : vat,
							ewt : ewt,
							overpayment : overpayment,
							ordervalue : ordervalue,
							unapplied : unapplied,

						},
					success: function (data) 
					{
						
						var res = $.parseJSON(data);
						if(res.valid == true)
						{
							$('#tblUploadResult tr:last').after(res.html);
						
							
						}
						else
						{
							
							
							
						}
					}
				});
				

			},2000)
			

		
	});
$(document.body).on('click', '#btnUpload', async function(){

	const hasEnoughFreeMemory = await hasEnoughFreeMem();

	if (!hasEnoughFreeMemory) {
		promptMessage(
			'JWS UPLOADER', 
			'Awaiting permission to load file...',
			'(This usually happens when Server does not have enough free memory or it reaches 90% usage)' 
		);

		await timeout(2000);
		$('#promptModal').modal('hide');
		$('#btnUpload').trigger('click');
		
		return false;
	}

	$('#btnBrowse').attr('disabled', true);
	//Reference the FileUpload element.
	$(this).attr('disabled', true);
	lineErrors = 0;
	lineCount = 0;
	SAPObjArr = [];
    let fileUpload = $("#chooseFile")[0];

    //Validate whether File is valid Excel file.
    let regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
    if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
            let reader = new FileReader();

            //For Browsers other than IE.
            if (reader.readAsBinaryString) {
                reader.onload = function (e) {
                	let prop = {
                		data: e.target.result,
                	}
                	promptMessage2Buttons2ReturnBools(
                		'Withholding Tax', 
                		'Do you want to enable Withholding Tax settings?', 
                		'Yes', 
                		'No', 
                		promptBeforeProcessExcel,
                		prop 
                	);
                };
                reader.readAsBinaryString(fileUpload.files[0]);
            } else {
                //For IE Browser.
                reader.onload = function (e) {
                    let data = "";
                    let bytes = new Uint8Array(e.target.result);
                    for (let i = 0; i < bytes.byteLength; i++) {
                        data += String.fromCharCode(bytes[i]);
                    }
                    let prop = {
                		data: data,
                	}
                	promptMessage2Buttons2ReturnBools(
                		'Withholding Tax', 
                		'Do you want to enable Withholding Tax settings?', 
                		'Yes', 
                		'No', 
                		promptBeforeProcessExcel,
                		prop 
                	);
                };
                reader.readAsArrayBuffer(fileUpload.files[0]);
            }
        } else {
            alert("This browser does not support HTML5.");
        }
    } else {
        alert("Please upload a valid Excel file.");
    }
});

$(document.body).on('click', '#btnPost', function(){
	postARCreditMemo();
});
async function populateHeaderFields(){


}
async function wtaxcodegenerate(){

	let cardCode = $('#txtCardCode').val();

	$.ajax(
			{
				type: 'GET',
				url: '../proc/views/vw_getWtax.php',
				data: {
					cardCode : cardCode
				
				},
				success: function (data) 
				{
					
					var res = $.parseJSON(data);
					if(res.valid == true)
					{
						
						$('#txtWtLiableArray').val(res.wtaxCode);
						$('#modal-load-init').modal('hide');
					}
					else
					{
						
						
						$('#modal-load-init').modal('hide');
					}
				}
			});
}
async function postARCreditMemo(){

		var err = 0;
        var errmsg = '';

		if($('#txtBPLId').val() == '' ){
			err = 1;
			$('#messageBar2').addClass('d-none');
						$('#messageBar3').removeClass('d-none');
						$('#messageBar').text('Select Business Partner first!').css({'background-color': 'red', 'color': 'white'});
						
							setTimeout(function()
							{
								$('#messageBar').text('').css({'background-color': '', 'color': ''});	
								$('#messageBar2').removeClass('d-none');
							},5000)
		}
	
		if($('#txtCardCode').val() == '' ){
			err = 1;
			$('#messageBar2').addClass('d-none');
						$('#messageBar3').removeClass('d-none');
						$('#messageBar').text('Select Business Partner first!').css({'background-color': 'red', 'color': 'white'});
						
							setTimeout(function()
							{
								$('#messageBar').text('').css({'background-color': '', 'color': ''});	
								$('#messageBar2').removeClass('d-none');
							},5000)
		}
	
       

		var txtBplId = $('#txtBPLId').val(); 
		var txtCardCode = $('#txtCardCode').val();
		var txtPostingDate = $('#txtPostingDate').val();

		let txtTransferGLCode = $('#txtTransferGLCode').val();
        let txtTransferDate = $('#txtTransferDate').val();
        let txtTransferRef = $('#txtTransferRef').val();
        let txtTransferAmount = $('#txtTransferAmount').val();

        var txtRemarks = $('#txtRemarks').val();
        var txtRemarks2 = $('#txtRemarks2').val();


     
	
		let txtWtLiableArray =   $('#txtWtLiableArray').val() ;


		//CREDIT MEMO ROWS
		var json8 = '{';
        var otArr8 = [];
        var ctr = 1;
        var tbl = $('#tblUploadResult tbody tr').each(function (i) 
		{
            x = $(this).children();
            var itArr = [];
            if($(this).find('input.bplname').val() == 'Total' && $(this).find('input').hasClass('totalcommissiontotal')){
            		itArr.push('"' + "6125000003" + '"');
            		itArr.push('"' + "Deductions/Commissions" + '"');
            		itArr.push('"' + $(this).find('input.totalcommissiontotal').val().replace(/,/g, '') + '"');

				otArr8.push('"' + 0 + '": [' + itArr.join(',') + ']'); 
				
            }
        });
		var json = '{';
        var otArr = [];
        var ctr = 1;
        var tbl = $('#tblUploadResult tbody tr').each(function (i) 
		{
            x = $(this).children();
            var itArr = [];
            if($(this).find('input.bplname').val() == 'Total' && $(this).find('input').hasClass('deductionstotal')){
            		itArr.push('"' + "6125000003" + '"');
            		itArr.push('"' + "Total Commission" + '"');
            		itArr.push('"' + $(this).find('input.deductionstotal').val().replace(/,/g, '') + '"');

				otArr.push('"' + 0 + '": [' + itArr.join(',') + ']'); 
				
            }
        });
        var json6 = '{';
        var otArr6 = [];
        var tbl = $('#tblUploadResult tbody tr').each(function (i) 
		{
			var itArr = [];
             if($(this).find('input.bplname').val() == 'Total' && $(this).find('input').hasClass('platformtotal')){
         			itArr.push('"' + "6125000003" + '"');
        			itArr.push('"' + "Platform Fees" + '"');
           			itArr.push('"' + $(this).find('input.platformtotal').val().replace(/,/g, '') + '"');

				otArr6.push('"' + 1 + '": [' + itArr.join(',') + ']'); 
            }
        });
        var json1 = '{';
        var otArr1 = [];
        var tbl = $('#tblUploadResult tbody tr').each(function (i) 
		{
			var itArr = [];
               if($(this).find('input.bplname').val() == 'Total' && $(this).find('input').hasClass('wastagetotal')){
               itArr.push('"' + "7000000001" + '"');
        		itArr.push('"' + "Wastage" + '"');
               	itArr.push('"' + $(this).find('input.wastagetotal').val().replace(/,/g, '') + '"');
           		 
				otArr1.push('"' + 2 + '": [' + itArr.join(',') + ']'); 
            }
        });
        var json2 = '{';
        var otArr2 = [];
        var tbl = $('#tblUploadResult tbody tr').each(function (i) 
		{
			var itArr = [];
               if($(this).find('input.bplname').val() == 'Total' && $(this).find('input').hasClass('adjustmentstotal')){
              itArr.push('"' + "6125000003" + '"');
        		itArr.push('"' + "Adjustments" + '"');
           		itArr.push('"' + $(this).find('input.adjustmentstotal').val().replace(/,/g, '') + '"');
           		 
				otArr2.push('"' + 3 + '": [' + itArr.join(',') + ']'); 
            }
        });
        var json3 = '{';
        var otArr3 = [];
        var tbl = $('#tblUploadResult tbody tr').each(function (i) 
		{
			var itArr = [];
               if($(this).find('input.bplname').val() == 'Total' && $(this).find('input').hasClass('merchanttotal')){
               	itArr.push('"' + "6125000003" + '"');
        		 itArr.push('"' + "Merchant Promo" + '"');	
           		 itArr.push('"' + $(this).find('input.merchanttotal').val().replace(/,/g, '') + '"');
           		 
				otArr3.push('"' + 4 + '": [' + itArr.join(',') + ']'); 
            }
        });
        var json4 = '{';
        var otArr4 = [];
        var tbl = $('#tblUploadResult tbody tr').each(function (i) 
		{
			var itArr = [];
                if($(this).find('input.bplname').val() == 'Total' && $(this).find('input').hasClass('vat')){
                	// itArr.push('"' + "2132600007" + '"');
                	itArr.push('"' + "1210000003" + '"');
                	
        		 	itArr.push('"' + "VAT" + '"');	
					itArr.push('"' + $(this).find('input.vat').val().replace(/,/g, '') + '"');
           		 
				otArr4.push('"' + 5 + '": [' + itArr.join(',') + ']'); 
            }
         });
        var json5 = '{';
        var otArr5 = [];
        var tbl = $('#tblUploadResult tbody tr').each(function (i) 
		{
			var itArr = [];
                if($(this).find('input.bplname').val() == 'Total' && $(this).find('input').hasClass('ewt')){
                	itArr.push('"' + "2132600002" + '"');
        		 	itArr.push( '"' + "EWT" + '"');	
                	itArr.push('"' + $(this).find('input.ewt').val().replace(/,/g, '') + '"');
           		 
				otArr5.push('"' + 6 + '": [' + itArr.join(',') + ']'); 
            }	
					
			
		});
		var json9 = '{';
        var otArr9 = [];
        var tbl = $('#tblUploadResult tbody tr').each(function (i) 
		{
			var itArr = [];
                if($(this).find('input.bplname').val() == 'Total' && $(this).find('input').hasClass('overpayment')){
                	itArr.push('"' + "7000000001" + '"');
        		 	itArr.push( '"' + "Overpayment" + '"');	
                	itArr.push('"' + $(this).find('input.overpayment').val().replace(/,/g, '') + '"');
           		 
				otArr9.push('"' + 7 + '": [' + itArr.join(',') + ']'); 
            }	
					
			
		});
		var json10 = '{';
        var otArr10 = [];
        var tbl = $('#tblUploadResult tbody tr').each(function (i) 
		{
			var itArr = [];
                if($(this).find('input.bplname').val() == 'Total' && $(this).find('input').hasClass('unapplied')){
                	itArr.push('"' + "2110400002" + '"');
        		 	itArr.push('"' + "Unapplied +/-" + '"');	
					itArr.push('"' + $(this).find('input.unapplied').val().replace(/,/g, '') + '"');
           		 
				otArr10.push('"' + 5 + '": [' + itArr.join(',') + ']'); 
            }
         });
		//INCOMING PAYMENT ROWS
		var json7 = '{';
        var otArr7 = [];
		var tbl = $('#tblUploadResult tbody tr').each(function (i) 
		{
            x = $(this).children();
            var itArr7 = [];
            if($(this).find('input.bplname').val() != 'Total'){
            	itArr7.push('"' + $(this).find('input.docnum').val().replace(/,/g, '') + '"');
            	//itArr7.push('"' + $(this).find('input.openbalance').val().replace(/,/g, '') + '"');
            	itArr7.push('"' + $(this).find('input.ordervalue').val().replace(/,/g, '') + '"');
            	itArr7.push('"' + $(this).find('input.overpayment').val().replace(/,/g, '') + '"');
            	itArr7.push('"' + $(this).find('input.unapplied').val().replace(/,/g, '') + '"');
				otArr7.push('"' + i + '": [' + itArr7.join(',') + ']'); 
				
            }
        });



		json += otArr.join(",") + '}';
		json1 += otArr1.join(",") + '}';
		json2 += otArr2.join(",") + '}';
		json3 += otArr3.join(",") + '}';
		json4 += otArr4.join(",") + '}';
		json5 += otArr5.join(",") + '}';
		json6 += otArr6.join(",") + '}';
		json7 += otArr7.join(",") + '}';
		json8 += otArr8.join(",") + '}';
		json9 += otArr9.join(",") + '}';
		json10 += otArr10.join(",") + '}';
		
        if (err == 0) 
		{
			$('#loadModal').modal('show');
            $.ajax({
                type: 'POST',
                url: '../proc/exec/exec_add_incoming-payments-upload-credit-memo.php',
				data: 
				{
					json: json.replace(/(\r\n|\n|\r)/gm, '[newline]'),
					json1: json1.replace(/(\r\n|\n|\r)/gm, '[newline]'),
					json2: json2.replace(/(\r\n|\n|\r)/gm, '[newline]'),
					json3: json3.replace(/(\r\n|\n|\r)/gm, '[newline]'),
					json4: json4.replace(/(\r\n|\n|\r)/gm, '[newline]'),
					json5: json5.replace(/(\r\n|\n|\r)/gm, '[newline]'),
					json6: json6.replace(/(\r\n|\n|\r)/gm, '[newline]'),
					json7: json7.replace(/(\r\n|\n|\r)/gm, '[newline]'),
					json8: json8.replace(/(\r\n|\n|\r)/gm, '[newline]'),
					json9: json9.replace(/(\r\n|\n|\r)/gm, '[newline]'),
					json10: json10.replace(/(\r\n|\n|\r)/gm, '[newline]'),

					txtBplId : txtBplId,
					txtCardCode : txtCardCode,
					txtPostingDate : txtPostingDate,
					txtTransferDate : txtTransferDate,
					txtTransferGLCode : txtTransferGLCode,
					txtTransferRef : txtTransferRef,
					txtTransferAmount : txtTransferAmount,
					txtRemarks : txtRemarks,
					txtRemarks2 : txtRemarks2,
					txtWtLiableArray : txtWtLiableArray,
			
				
                },
			    success: function (data) 
				{
					var res = $.parseJSON(data);
					
					if(res.valid == true)
					{
						$('#messageBar2').addClass('d-none');
						$('#messageBar3').removeClass('d-none');
						$('#messageBar').text(res.msg).css({'background-color': '#00FF7F', 'color': 'black'});
						
						
							setTimeout(function()
							{
								$('#messageBar').text('').css({'background-color': '', 'color': ''});	
								
							window.location.replace("../templates/" + mainFileName + "-document.php");
							},3000)
					}
					else
					{
						$('#messageBar2').addClass('d-none');
						$('#messageBar3').removeClass('d-none');
						$('#messageBar').text(res.msg).css({'background-color': 'red', 'color': 'white'});
						
							setTimeout(function()
							{
								$('#messageBar').text('').css({'background-color': '', 'color': ''});	
								
							},5000)
					}
					$('#loadModal').modal('hide');
                }
            });
        }
		else 
		{
			$('#messageBar').val('Out of bounds').css({'background-color': 'red', 'color': 'white'});
				setTimeout(function()
				{
					$('#messageBar').val('').css({'background-color': '', 'color': ''});	
				},5000)
        }
	}	

	


async function promptBeforeProcessExcel(bool, prop) {

	showLoadingBar();
	isWtEnabled = bool;
	ProcessExcel(prop.data)
}

async function ProcessExcel(data) {
    //Read the Excel File data.
    let workbook = XLSX.read(data, {
        type: 'binary'
    });

    $('#tblUploadResult > tbody, #tblUploadResult > thead tr').html('');

    //Fetch the name of First Sheet.
    let sheet = workbook.SheetNames[0];

    if (isNonTradeType) {
    	reportType = 'nonTrade';
    	toCardCode = toCardCode1;
    	toCardName = toCardName1;
    	tableHeaders = tableHeadersObj.nonTrade;
    	excelHeaders = excelHeadersObj.nonTrade;
    } else {
    	reportType = 'trade';
    	toCardCode = toCardCode2;
    	toCardName = toCardName2;
    	tableHeaders = tableHeadersObj.trade;
    	excelHeaders = excelHeadersObj.trade;
    }

    let excelRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {defval:''});
   	
   	try {
   		dataTableObj = await excelObjToDataObj(excelRows);
   	} catch (err) {
   		hideLoadingBar();
   		resetState();
   		portalMessage(err.name + ': ' + err.message, 'red', 'white')
		return false;
   	}
    

    let totalLines = dataTableObj.detailLines.reduce((acc, itemGroup) => {
		return acc + itemGroup.lines.reduce((acc, line) =>  acc + 1, 0);
	}, 0);

    tableRows = 0;

    let totalLoadingCount = totalLines + tableHeaders.length;
    let loadingCount = 0, lineCount = 0;

    //Create a HTML Table element.
    let table = $('#tblUploadResult');

   	//Add the header cells.
   	let tableHeader = $('#tblUploadResult > thead tr');
	for (header of tableHeaders){
		if (header === 'WT Amount')
			header = 'WT<br>Amount';
		else if (header === 'Total Amount Due')
			header = 'Total<br>Amount Due'
		else if (header === 'Gross Total')
			header = 'Gross<br>Total'
		
		if (isWtEnabled)
			tableHeader.append('<th style="position: sticky; top: 0px; border-top: 2px solid gray;">'+ header +'</th>');
		else {
			if (!(header === 'WT Liable' || header === 'WT Code' || header === 'WT<br>Amount'))
				tableHeader.append('<th style="position: sticky; top: 0px; border-top: 2px solid gray;">'+ header +'</th>');
		}

		if (header === 'Reference No.')
			tableHeader.find('th:last-child').attr('title', '(DR# for APV / WF# for APCM)');
	}

    //Add the data rows from Excel file.
    let tableBody = $('#tblUploadResult > tbody'), colorBool = true;
    let tempObj = JSON.parse(JSON.stringify(dataTableObj))
    for (detailLine of dataTableObj.detailLines) {
    	let lineArr = detailLine;

    	if (colorBool)
    		colorBool = false;
    	else
    		colorBool = true;

    	for (line of lineArr.lines) {
    		tableBody.append('<tr></tr>');
    		let currentRow = tableBody.find('tr:last-child');
    		lineCount++;

    		let message = lineCount !== detailLineCount ? 
    			`Inserting ${++loadingCount} out of ${totalLoadingCount - tableHeaders.length} lines ` 
    			:
    			'Please wait... Revalidating each transaction... ';

    		lineCount !== detailLineCount ? loadingBar(loadingCount, detailLineCount, message) : loadingBar(100, 100, message, true);
    		await timeout(1);

    		if (colorBool)
    			currentRow.addClass('table-warning');

	    	for (header of tableHeaders){

		   		let cell = $("<td />");
		   		if (header === '#') {
		   			currentRow.append('<td class="rowNo">'+lineCount+'</td>');
		   		} else if (header === 'Vendor Name') {
		   			let cardNameHtml;
		   			if (toCardName.toUpperCase() == 'RED RIBBON BAKESHOP INC.')
		   				cardNameHtml = 'RED RIBBON<br>BAKESHOP INC.';
		   			else
		   				cardNameHtml = 'ZENITH FOODS<br>CORPORATION';
		   			currentRow.append('<td class="vendorName">'+toCardName.toUpperCase()+'</td>');
		   		} else if (header === 'Sales Order') {
		   			currentRow.append('<td class="salesOrder">'+line.salesOrder+'</td>');
		   		} else if (header === 'Reference No.') {
		   			currentRow.append(`<td class="refNo">${line.total > 0 ? line.drNo : line.wfNo}</td>`);
		   		} else if (header === 'Billing No.') {
		   			currentRow.append('<td class="billNo">'+line.billNo+'</td>');
		   		} else if (header === 'Posting Date') {
		   			currentRow.append('<td class="postingDate">'+SAPDateFormater(line.billDate).value+'</td>');
		   		} else if (header === 'Item Code') {
		   			currentRow.append('<td class="itemCode">'+line.itemCode+'</td>');
		   		} else if (header === 'Item Details') {
		   			currentRow.append('<td class="itemDetails">'+line.text+'</td>');
		   		} else if (header === 'Item Name') {
		   			currentRow.append(`<td class="itemName">${reportType === 'trade' ? line.text : line.itemName}</td>`);
		   		} else if (header === 'Quantity') {
		   			currentRow.append('<td floatVal="'+Math.abs(line.quantity)+'" class="quantity">'+line.quantity+'</td>');
		   		} else if (header === 'Gross Total') {
		   			let title = line.total < 0 ? 'Negative value in raw file' : 'Positive value in raw file' ;
		   			currentRow.append('<td class="grossTotal text-right" title="'+title+'" floatVal="'+Math.abs(line.total)+'">'+FormatMoney(Math.abs(line.total))+'</td>');
		   		} else if (header === 'Remarks') {
		   			currentRow.append('<td class="remarks"></td>');
		   		} else if (header === 'Total Amount Due') {
		   			let title = line.total < 0 ? 'Negative value in raw file' : 'Positive value in raw file' ;
		   			currentRow.append('<td class="totalAmountDue text-right" title="'+title+'" floatVal="'+Math.abs(line.total)+'">'+FormatMoney(Math.abs(line.total))+'</td>');
		   		} else if (header === 'WT Liable' && isWtEnabled) {
		   			currentRow.append('<td class="wtLiable"><select id2="'+lineCount+'" class="selWtLiable"><option value="Y">Yes</option><option value="N">No</option></select></td>');
		   		} else if (header === 'WT Code' && isWtEnabled) {
		   			let refClassId = '';
		   			if (reportType === 'nonTrade')
		   				refClassId = line.billNo;
		   			else {
		   				if (line.total > 0)
		   					refClassId = line.drNo;
		   				else
		   					refClassId = line.wfNo;
		   			}
		   			currentRow.append('<td refClassId="ref'+refClassId+'" class="wtCode"></td>');
		   		} else if (header === 'WT Amount' && isWtEnabled) {
		   			currentRow.append('<td class="wtAmount text-right"></td>');
		   		} else if (header === 'Message') {
					currentRow.append('<td class="message"></td>');
		   		} else if (header === 'Status') {
		   			currentRow.append('<td class="status"></td>');
		   		}
		   }
    	}
    }

    $("#btnExcelDownload").parent().removeClass('d-none');

    if (dataTableObj.branchName !== undefined) {
    	responseObj = await primValidation('branchName', dataTableObj.branchName);
    	if (!responseObj.error) {
	    	$('#selBranchName option').filter(function() {
				return $(this).text() == responseObj.branchName;
			}).prop('selected', true).css('font-weight', 'bold');
			$('#txtDetected').removeClass('d-none');
	    }
    }

    let colSetting = await $('#tblUploadResult th, #tblUploadResult td').css('white-space', 'nowrap');
    let resObj = await objValidation('dataObj-lines', dataTableObj);
    let validatedLines = resObj.lineObjArr;
    dataTableObj = resObj.dataObj;

    $('#selBranchName option').filter(function() {
		return $(this).text() == dataTableObj.branchName;
	}).prop('selected', true).css('font-weight', 'bold')
	if ($('#selBranchName').val() !== null) {
		$('#txtDetected').removeClass('d-none');
		$('#selBranchName').attr('title', 'Branch of the base documents listed in the remarks below.');
	}


    tableBody.find('tr').each(function(i){
    	if (validatedLines[i].error) {
    		$(this).find('td.message').html(validatedLines[i].message);
    		$(this).find('td.message').addClass('text-danger');
    		$(this).find('td.status').text('FAILED');
    		$(this).find('td.status').addClass('text-danger');
    		lineErrors++;
    	} else {
    		if (validatedLines[i].message === 'No errors found')
    			$(this).find('td.message').text(validatedLines[i].message);
    		else {
    			$(this).find('td.message').html(validatedLines[i].message);
    			if (validatedLines[i].message.search('SAP default UoM Code') !== -1)
    				$(this).find('td.message').attr('title', 'Found UoMCode in the raw file is '+validatedLines[i].givenUoMCode)
    			$(this).find('td.message').addClass('text-primary');
    		}
    		$(this).find('td.status').text('SUCCESS');
	    	$(this).find('td.status').addClass('text-success');
    	}
    	if (reportType === 'trade')
    		$(this).find('td.remarks').text(validatedLines[i].remarks);

    	if (validatedLines[i].uoMCodeToUse !== '' && (validatedLines[i].givenUoMCode !== 'ST')) {
    		$(this).find('td.quantity').text(validatedLines[i].quantity * validatedLines[i].conversionFactor);
    		$(this).find('td.message, td.status').removeClass('text-danger');
    		$(this).find('td.message').addClass('text-primary');
    		$(this).find('td.quantity').attr('title', 'This is SAP default UoM Code.\nQuantity and Gross Price are automatically converted.\nFound UoMCode and Quantity in the raw file are '+validatedLines[i].givenUoMCode+' and '+validatedLines[i].quantity+', respectively.')
    		$(this).find('td.quantity').addClass('text-primary');
    	}

    	if (reportType === 'nonTrade' && validatedLines[i].itemName !== '')
    		$(this).find('td.itemName').html(validatedLines[i].itemName);

    	if (isWtEnabled) {
    		$(this).find('td.wtCode').html(resObj.wtCodeHtml);
	    	selWtCode = $(this).find('td.wtCode select');
		    selWtCode.attr('id2', i + 1);
    	}

	    if (taxRate === 0)
	    	taxRate = validatedLines[i].tax.rate;
    });

	if (!$.fn.DataTable.isDataTable('#tblUploadResult')) {
	 	$('#tblUploadResult').DataTable({
	 		destroy: true,
	    	searching: true,
	    	ordering: true,
	    	paging: false, 
	    	info: false
	    });
	}

	loadingBar(100, 100, 'Waiting for Withholding tax implementation...', true);

	if (isWtEnabled) {
		let message = '',
			info = '';

		if (reportType === 'trade') {
			if (resObj.wtCodeHtml) {
				message = '<div class="" id="promptDiv"><span>Please select the Withholding Tax Code that will be initially applied to all listed transactions&nbsp;&nbsp;</span>'+resObj.wtCodeHtml+'</div>';
				info = '(Note: You can still change the Withholding tax code for each transaction later)';
			} else {
				message = toCardName + ' is not subject to Withholding tax. To enable this option, go to SAP Business One > Business Partner Master Data > Accounting > Tax.';
			}

			await timeout(500)
			promptMessage1Button1ReturnBool(
				'Withholding Tax', 
				message, 
				'OK', 
				settingInitWtConfig,
				{},
				info
			);
		} else {
			if (!resObj.wtCodeHtml) {
				message = toCardName + ' is not subject to Withholding tax. To enable this option, go to SAP Business One > Business Partner Master Data > Accounting > Tax.';
				await timeout(500)
				promptMessage1Button1ReturnBool(
					'Withholding Tax', 
					message, 
					'OK', 
					settingInitWtConfig,
					{},
					info
				);
			} else
				settingInitWtConfig();
		}
		
	} else
		finalizeUpload();

	async function settingInitWtConfig(tRate = taxRate) {
		loadingBar(100, 100, 'Applying changes...', true);

		let wtCode;
		let wtAccount;

		if (reportType === 'trade') {
			wtCode = $('#promptDiv select option:selected').text();
			wtAccount = $('#promptDiv select option:selected').attr('account');
		}

		tableBody.find('tr').each(function(i){ 
			let selWtCode = $(this).find('td.wtCode select');

			if (reportType === 'nonTrade' && nonTradeEWTArr[i] !== '') {
				selWtCode.find('option').filter(function() {
					return $(this).text().toUpperCase().trim() == nonTradeEWTArr[i].toUpperCase().trim();
				}).prop('selected', true).css('font-weight', 'bold');

				wtAccount = selWtCode.find('option:selected').attr('account');
				if (selWtCode.find('option:selected').text().toUpperCase().trim() != nonTradeEWTArr[i].toUpperCase().trim())
					wtCode = null;
				else
					wtCode = selWtCode.find('option:selected').text().toUpperCase().trim();
			} else {
				selWtCode.find('option').filter(function() {
					return $(this).text() == wtCode;
				}).prop('selected', true);
			}

	    	if (resObj.wtCodeHtml) {
	    		let wtRate = Number(selWtCode.val());
	    		let wtAmount;
				if (reportType === 'nonTrade' && (nonTradeEWTArr[i] === '' || wtCode === null)) {
					$(this).find('td.wtLiable select').val('N');
					if (nonTradeEWTArr[i] === '')
						$(this).find('td.wtLiable select').attr('title', 'No EWT code found in the raw file for this line')
					else if (wtCode === null)
						$(this).find('td.wtLiable select').attr('title', 'The given EWT code in the raw file cannot be found in the enabled WTax code(s) of ' + toCardName)
					selWtCode.addClass('d-none');
				} else {
					$(this).find('td.wtLiable select').val('Y');
					let total = reportType === 'trade' ? 
						Number($(this).find('td.grossTotal').attr('floatVal'))
						:
						Number($(this).find('td.totalAmountDue').attr('floatVal'));
			    	let totalBeforeVat = total/(1 + tRate);
			    	wtAmount = totalBeforeVat * wtRate;
			    	$(this).find('td.wtAmount').text(FormatMoney(wtAmount));
			    	
			    	selWtCode.attr('title', 'The withholding tax amount for this row is '+ FormatMoney(wtAmount))
				}

	    		dataTableObj.detailLines = dataTableObj.detailLines.map(lineObj => {
					lineObj.lines = lineObj.lines.map(line => {
						if (line.lineNo == i + 1) {
							if (reportType === 'nonTrade' && (nonTradeEWTArr[i] === '' || wtCode === null))
								line.wTax.liable = 'N';
							else {
								line.wTax.liable = 'Y';
								line.wTax.code = wtCode;
								line.wTax.rate = wtRate;
								line.wTax.account = wtAccount;
								line.wTax.amount = wtAmount;
								line.wTax.taxableAmount = (Math.abs(line.total)/(1 + line.tax.rate));
							}
						}
						return line
					})
					return lineObj;
				})
	    	} else {
	    		$(this).find('td.wtLiable select').addClass('d-none')
	    	}

		});

		finalizeUpload();
	}

	async function finalizeUpload() {
	
		await lineObjsToSAPObjs(dataTableObj, $('#btnPost')).then(res => SAPObjArr = res);

	    $('#uploadResult').removeClass('d-none');
	    hideLoadingBar();

		$("#allCount").text(dataTableObj.detailLines.length);
		$("#validCount").text(SAPObjArr.length);
		$("#invalidCount").text(dataTableObj.detailLines.length - SAPObjArr.length);
		$("#countDisplay").removeClass('d-none');

	    let rowsArray = [];
	    rowsArray.push(tableHeaders);
	    let cellsArray = [];
	    tableBody.find('tr').each(function(){
	    	cellsArray = [];
	    	$(this).find('td').each(function(){
	    		if ($(this).hasClass('quantity') ||
	    			$(this).hasClass('grossTotal') ||
	    			$(this).hasClass('totalAmountDue') ||
	    			$(this).hasClass('wtAmount')) {
	    			if ($(this).attr('floatVal') !== undefined && $(this).attr('floatVal') !== false)
	    				cellsArray.push(Number($(this).attr('floatVal').replace(',', '')));
	    			else
	    				cellsArray.push(Number($(this).text().replace(',', '')));
	    		}
	    		else if ($(this).has('select').text() === '')
	    			cellsArray.push($(this).text());
	    		else
	    			cellsArray.push($(this).find('select option:selected').text());
	    	})
	    	rowsArray.push(cellsArray);
	    });

	    tableToExcel(rowsArray, mainFileName+'-table');

		$('#btnBrowse').removeAttr('disabled');
	}
}

async function tableToExcel(arrayOfArrays, fileName) {
	var wb = XLSX.utils.book_new();

	wb.Props = {
        Title: "Addon Table to Excel",
        Subject: "Export",
        Author: "JCBA",
        CreatedDate: new Date()
    };

    wb.SheetNames.push('exported from JCBA web portal');

    var ws_data = arrayOfArrays;  //a row with 2 columns

    var ws = XLSX.utils.aoa_to_sheet(ws_data);

    wb.Sheets['exported from JCBA web portal'] = ws;

    var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});

    function s2ab(s) { 
        var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        var view = new Uint8Array(buf);  //create uint8array as viewer
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
        return buf;    
	}

	$("#btnExcelDownload").text('Download table as Excel file');
	$("#btnExcelDownload").removeAttr('disabled');

	$("#btnExcelDownload").off('click').click(function(){
       saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), fileName+'.xlsx');
	});
}

async function excelObjToDataObj(excelRows){
	detailLineCount = 0, nonTradeEWTArr = [];

	let dataObj = {
		customerCode: '',
		storeName: '',
		reportType: reportType,
		branchId: '',
		branchName: '',
		detailLines: []
	}

	let count = 0, 
		isFinal = false, 
		detailLineObjArr = [], 
		refNoBuff = '', 
		lineObjArr = [],
		testCount = 0,
		requiredNonTradeHeadersArr = [
			'CUSTOMER CODE',
			'STORE NAME',
			'BILLING NUMBER',
			'BILLING DATE',
			'PRODUCT',
			'ITEM CODE',
			'EWT or ATC',
			'TOTAL',
			'VAT'
		],
		requiredTradeHeadersArr = [
			'CUSTOMER CODE',
			'STORE NAME',
			'BILLING NUMBER',
			// 'wf #',
			'SALES ORDER',
			'DR NUMBER',
			'BILLING DATE',
			'PRODUCT',
			'ITEM CODE',
			'QTY',
			'UOM',
			'TOTAL',
			'VAT'
		];

	for (item of excelRows) {
		count++;

		if (String(item['Product']).toUpperCase().search('ROYALT') !== -1)
			continue;

		let lineObj = {
			billDate: new Date(),
			billNo: '',
			salesOrder: '',
			drNo: '',
			wfNo: '',
			itemCode: '',
			itemName: '',
			text: '',
			conversionFactor: 1,
			quantity: 0.00,
			total: 0.00,
			vat: 0.00,
			error: false, 
			initErrorMsg: '',
			nextErrorMsg: '',
			message: 'No errors found',
			lineNo: '',
			isDocFirstLine: false,
			tax: {
				code: '',
				rate: 0.00,
			},
			wTax: {
				liable: 'N',
				code: '',
				rate: 0.00,
				amount: 0.00,
				taxableAmount: 0.00, 
				account: ''
			},
			baseEntry: '',
			baseLine: '',
			remarks: '',
			givenUoMCode: '',
			uoMEntryToUse: '',
			uoMCodeToUse: '',
			toChildTable1: toChildTable1
		};

		let errorMsgArr = [], index;

		for (propRaw in item) {

			prop = String(propRaw).trim().toUpperCase();

			if (requiredNonTradeHeadersArr.length && requiredTradeHeadersArr.length) {
				if (prop === 'CUSTOMER CODE') {
					index = requiredNonTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredNonTradeHeadersArr.splice(index, 1);

					index = requiredTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredTradeHeadersArr.splice(index, 1);
				}
				else if (prop === 'STORE NAME') {
					index = requiredNonTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredNonTradeHeadersArr.splice(index, 1);

					index = requiredTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredTradeHeadersArr.splice(index, 1);
				}
				else if (prop === 'BILLING NUMBER') {
					index = requiredNonTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredNonTradeHeadersArr.splice(index, 1);

					index = requiredTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredTradeHeadersArr.splice(index, 1);
				}
				else if (prop.toUpperCase().search('WF') !== -1 && reportType === 'trade') {
					index = requiredTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredTradeHeadersArr.splice(index, 1);
				}
				else if (prop === 'SALES ORDER' && reportType === 'trade') {
					index = requiredTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredTradeHeadersArr.splice(index, 1);
				}
				else if (prop === 'DR NUMBER' && reportType === 'trade') {
					index = requiredTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredTradeHeadersArr.splice(index, 1);
				}
				else if (prop === 'BILLING DATE') {
					index = requiredNonTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredNonTradeHeadersArr.splice(index, 1);

					index = requiredTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredTradeHeadersArr.splice(index, 1);
				}
				else if (prop === 'PRODUCT') {
					index = requiredNonTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredNonTradeHeadersArr.splice(index, 1);

					index = requiredTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredTradeHeadersArr.splice(index, 1);
				}
				else if (prop === 'ITEM CODE') {
					index = requiredNonTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredNonTradeHeadersArr.splice(index, 1);

					index = requiredTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredTradeHeadersArr.splice(index, 1);
				}
				else if (prop === 'QTY' && reportType === 'trade') {
					index = requiredTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredTradeHeadersArr.splice(index, 1);
				}
				else if (prop === 'UOM' && reportType === 'trade') {
					index = requiredTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredTradeHeadersArr.splice(index, 1);
				}
				else if ((String(prop).toLowerCase().search('ewt') !== -1 || 
					String(prop).toLowerCase().search('atc') !== -1) && reportType === 'nonTrade') {
					index = requiredNonTradeHeadersArr.indexOf('EWT or ATC');
					if (index > -1)
					  requiredNonTradeHeadersArr.splice(index, 1);
				}
				else if (prop === 'TOTAL') {
					index = requiredNonTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredNonTradeHeadersArr.splice(index, 1);

					index = requiredTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredTradeHeadersArr.splice(index, 1);
				}
				else if (prop === 'VAT') {
					index = requiredNonTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredNonTradeHeadersArr.splice(index, 1);

					index = requiredTradeHeadersArr.indexOf(prop);
					if (index > -1)
					  requiredTradeHeadersArr.splice(index, 1);
				}
			}


			if (prop === 'TOTAL' && item[propRaw] < 0 && reportType === 'nonTrade') {
				if (count === excelRows.length) {
					if (String(item[propRaw]).trim() === '')
						continue;
					else {
						detailLineObjArr.push({lines:lineObjArr});
						dataObj.detailLines = detailLineObjArr;
						return dataObj;
					}
				} else
					break;
			}

			if (count === excelRows.length) {
				if (String(item[propRaw]).trim() === '')
					continue;
				else {
					detailLineObjArr.push({lines:lineObjArr});
					dataObj.detailLines = detailLineObjArr;
					return dataObj;
				}
			}

			if (prop === 'CUSTOMER CODE' && dataObj.customerCode === '') {
				dataObj.customerCode = String(item[propRaw]).trim();
			} else if (prop === 'CUSTOMER CODE') {
				if (String(item[propRaw]).trim() === '')
					break;
			} else if (prop === 'STORE NAME') {
				if (Number(String(item[propRaw]).trim()) === 0 && !isNaN(Number(String(item[propRaw]).trim()))){
					lineObj.error = true;
					errorMsgArr.push('Store-Name');
					lineObj.storeName = '';
				} else
					dataObj.storeName = String(item[propRaw]).trim();
			} else if (prop === 'BILLING NUMBER') {
				if (String(item[propRaw]).trim() !== refNoBuff && reportType === 'nonTrade') {
					if (lineObjArr.length !== 0)
						detailLineObjArr.push({lines:lineObjArr});
					lineObjArr = [];
					refNoBuff = String(item[propRaw]).trim();
					lineObj.isDocFirstLine = true;
				}
				if (Number(String(item[propRaw]).trim()) === 0 && !isNaN(Number(String(item[propRaw]).trim()))){
					lineObj.error = true;
					errorMsgArr.push('Billing-No');
					lineObj.billNo = '';
				} else {
					lineObj.billNo = String(item[propRaw]).trim();
				}
			} else if (prop.toUpperCase().search('WF') !== -1 && reportType === 'trade') {
				if (Number(String(item[propRaw]).trim()) === 0 && !isNaN(Number(String(item[propRaw]).trim()))){
					lineObj.error = true;
					errorMsgArr.push('WF-Number');
					lineObj.wfNo = '';
				} else
					lineObj.wfNo = String(item[propRaw]).trim();
			} else if (prop === 'SALES ORDER' && reportType === 'trade') {
				if (Number(String(item[propRaw]).trim()) === 0 && !isNaN(Number(String(item[propRaw]).trim()))){
					lineObj.error = true;
					errorMsgArr.push('Sales-Order');
					lineObj.salesOrder = '';
				} else
					lineObj.salesOrder = String(item[propRaw]).trim();
			}  else if (prop === 'DR NUMBER' && reportType === 'trade') {
				if (Number(String(item[propRaw]).trim()) === 0 && !isNaN(Number(String(item[propRaw]).trim()))){
					// lineObj.error = true;
					// errorMsgArr.push('DR-Number');
					lineObj.drNo = '';
				} else
					lineObj.drNo = String(item[propRaw]).trim();
			} else if (prop === 'BILLING DATE') {
				if (Number(String(item[propRaw]).trim()) === 0 && !isNaN(Number(String(item[propRaw]).trim()))){
					lineObj.error = true;
					errorMsgArr.push('Billing-Date');
					lineObj.billDate = '';
				} else
					lineObj.billDate = SQLDateFormater(new Date((item[propRaw] - 25569) * 86400 * 1000))
			} else if (prop === 'PRODUCT') {
				if (Number(String(item[propRaw]).trim()) === 0 && !isNaN(Number(String(item[propRaw]).trim()))){
					lineObj.error = true;
					errorMsgArr.push('Product');
					lineObj.text = '';
				} else {
					lineObj.text = String(item[propRaw]).trim();
					let conversionFactor = 1;
					let arr = lineObj.text.replaceAll(' ', '').split(',');
					if (String(arr[arr.length - 1]).search('/') !== -1)
						conversionFactor = isNaN(parseInt(arr[arr.length - 1])) ? 1 : parseInt(arr[arr.length - 1]);
					lineObj.conversionFactor = conversionFactor;
				}
			} else if (prop === 'ITEM CODE') {
				if (Number(String(item[propRaw]).trim()) === 0 && !isNaN(Number(String(item[propRaw]).trim()))){
					lineObj.error = true;
					errorMsgArr.push('Item-Code');
					lineObj.itemCode = '';
				} else
					lineObj.itemCode = String(item[propRaw]).trim();
			} else if (prop === 'QTY' && reportType === 'trade') {
				if (Number(String(item[propRaw]).trim()) === 0 && !isNaN(Number(String(item[propRaw]).trim()))){
					lineObj.error = true;
					errorMsgArr.push('Quantity');
					lineObj.quantity = '';
				} else
					lineObj.quantity = item[propRaw];
			} else if (prop === 'UOM' && reportType === 'trade') {
				if (Number(String(item[propRaw]).trim()) === 0 && !isNaN(Number(String(item[propRaw]).trim()))){
					lineObj.error = true;
					errorMsgArr.push('Unit');
					lineObj.unit = '';
					lineObj.givenUoMCode = '';
				} else {
					lineObj.unit = String(item[propRaw]).trim() == 'PAK' ? 'PACK' : String(item[propRaw]).trim();
					lineObj.givenUoMCode = String(item[propRaw]).trim() == 'PAK' ? 'PACK' : String(item[propRaw]).trim();
				}
			} else if ((String(prop).toLowerCase().search('ewt') !== -1 || 
				String(prop).toLowerCase().search('atc') !== -1) && reportType === 'nonTrade') {
				if (Number(String(item[propRaw]).trim()) === 0 && !isNaN(Number(String(item[propRaw]).trim()))){
					errorMsgArr.push('No EWT code found');
					lineObj.wTax.code = '';
					nonTradeEWTArr.push('');
				} else {
					lineObj.wTax.code = String(item[propRaw]).trim();
					nonTradeEWTArr.push(String(item[propRaw]).trim());
				}
			} else if (prop === 'TOTAL') {
				if (Number(String(item[propRaw]).trim()) === 0 && !isNaN(Number(String(item[propRaw]).trim()))){
					lineObj.error = true;
					errorMsgArr.push('Total');
					lineObj.total = '';
				} else {
					lineObj.total = item[propRaw];
					if (reportType === 'trade') {
						if (lineObj.total > 0) {
							if (lineObj.drNo !== refNoBuff) {
								if (lineObjArr.length !== 0)
									detailLineObjArr.push({lines:lineObjArr});
								lineObjArr = [];
								refNoBuff = lineObj.drNo;
								lineObj.isDocFirstLine = true;
							}
						} else {
							if (lineObj.wfNo !== refNoBuff) {
								if (lineObjArr.length !== 0)
									detailLineObjArr.push({lines:lineObjArr});
								lineObjArr = [];
								refNoBuff = lineObj.wfNo;
								lineObj.isDocFirstLine = true;
							}
						}
					}
				}
			} else if (prop === 'VAT') {
				lineObj.vat = item[propRaw];
				detailLineCount++;
				lineObj.lineNo = detailLineCount;
				if (lineObj.total > 0) {
					let index = errorMsgArr.indexOf('WF-Number');
					if (index > -1) {
					  errorMsgArr.splice(index, 1);
					}
					if (errorMsgArr.length === 0)
						lineObj.error = false;
				} else {
					let index = errorMsgArr.indexOf('DR-Number');
					if (index > -1) {
					  errorMsgArr.splice(index, 1);
					}
					if (errorMsgArr.length === 0)
						lineObj.error = false;
				}

				if (lineObj.error)
					lineObj.initErrorMsg = 'Missing field(s): '+ errorMsgArr.join('<br>');

				lineObjArr.push(lineObj);
			}
		}

		if (requiredNonTradeHeadersArr.length && reportType === 'nonTrade') 
			throw {name: 'Missing_Required_Column', message: 'Cannot find ' + requiredNonTradeHeadersArr.join(', ')};
		if (requiredTradeHeadersArr.length && reportType === 'trade') 
			throw {name: 'Missing_Required_Column', message: 'Cannot find ' + requiredTradeHeadersArr.join(', ')};
	}
}

async function lineObjsToSAPObjs(dataObj, btnPost){


	let lineRefNo = '', SAPObjArr = [], SAPObj = {}, toObjectType, fromBaseType = '';

	let countLine = 0, totalLines = dataObj.detailLines.reduce((acc, itemGroup) => {
		return acc + itemGroup.lines.reduce((acc, line) =>  acc + 1, 0);
	}, 0);

	function getLineObj(line) {
		if (reportType === 'trade') {
			if (line.total > 0 ) {
				fromBaseType = Number(fromBaseType1);
			} else {
				fromBaseType = Number(fromBaseType2);
			}
		}
				
		let quantity; 

		if (line.uoMCodeToUse === '' || (line.givenUoMCode === 'ST')) 
			quantity = line.quantity;
		else
			quantity = line.quantity * line.conversionFactor;

		let lineObj = {
			fromBaseType: fromBaseType,
			baseEntry: Number(line.baseEntry),
			baseLine: Number(line.baseLine),
			itemCode: line.itemCode,
			text: line.text,
			quantity: reportType === 'nonTrade' ? 1 : quantity,
			cost: reportType === 'nonTrade' ? Math.abs(line.total) : Math.abs(line.total/quantity),
			uoMEntryToUse: line.uoMEntryToUse,
			wtLiable: line.wTax.liable,
			udf: [{
				columnName: 'U_BILLING',
				value: line.billNo
			},
			{
				columnName: 'U_SO',
				value: line.salesOrder
			}]
		}
		return lineObj;
	}


	dataObj.detailLines.map((itemGroup, index, array) => {
		itemGroup.lines.map(line => {
			countLine++

			if (!line.error) {

				let tradeRefNo = '';
				if (line.total > 0 ) {
					toObjectType = toObjectType1;
					tradeRefNo = line.drNo === '' ? line.salesOrder : line.drNo;
				} else {
					toObjectType = toObjectType2;
					tradeRefNo = line.wfNo;
				}
				

				let compareNo = reportType === 'nonTrade' ? line.billNo : tradeRefNo;

				if (compareNo != lineRefNo && line.isDocFirstLine) {
					if (typeof (SAPObj.refNo) !== 'undefined') {
						SAPObjArr.push(SAPObj);
					}

					lineRefNo = compareNo;
					SAPObj = {
						customerCode: dataObj.customerCode,
						storeName: dataObj.storeName,
						date: SQLDateFormater(new Date()),
						taxDate: SQLDateFormater(line.billDate),
						refNo: reportType === 'nonTrade' ? line.billNo : tradeRefNo,
						cardName: toCardName,
						cardCode: toCardCode,
						toObjectType: toObjectType,
						reportType: reportType,
						detailLines: [],
						wtCodes: []
					}

					if (line.wTax.liable === 'Y') {
						let wtCodeObj = {
							code: line.wTax.code,
							rate: line.wTax.rate,
							taxableAmount: line.wTax.taxableAmount,
							account: line.wTax.account
						}

						SAPObj.wtCodes.push(wtCodeObj);
					}
					
					SAPObj.detailLines.push(getLineObj(line));

				} else {
					if (typeof (SAPObj.refNo) !== 'undefined') {
						if (line.wTax.liable === 'Y') {
							let isFound = false;
							SAPObj.wtCodes.map(wtCodeObj => {
								if (!isFound && line.wTax.code === wtCodeObj.code) {
									isFound = true;
									wtCodeObj.taxableAmount += Number(line.wTax.taxableAmount);
								}
							});

							if (!isFound) {
								let wtCodeObj = {
									code: line.wTax.code,
									rate: line.wTax.rate,
									taxableAmount: line.wTax.taxableAmount,
									account: line.wTax.account
								}

								SAPObj.wtCodes.push(wtCodeObj);
							}
						}

						SAPObj.detailLines.push(getLineObj(line));
					}
					
				}
				
			} else {
				let tradeRefNo = '';
					if (line.total > 0)
						tradeRefNo = line.drNo;
					else
						tradeRefNo = line.wfNo;

				let compareNo = reportType === 'nonTrade' ? line.billNo : tradeRefNo;

				if (compareNo != lineRefNo) {
					if (typeof (SAPObj.refNo) !== 'undefined') {
						SAPObjArr.push(SAPObj);
						lineRefNo = compareNo;
						SAPObj = {};
					}
				} else {
					if (typeof (SAPObj.refNo) !== 'undefined' && onProd)
						SAPObj = {};
				}

			}

			
			if (countLine === totalLines) {
				if (typeof (SAPObj.refNo) !== 'undefined' && (!line.error || !onProd)) {
					SAPObjArr.push(SAPObj);
				}
			}
		});
	});

	btnPost.removeAttr('disabled');
	return SAPObjArr;
}

async function postingValidTransactions(){

	const canPostBool = await canPost();

	if (!canPostBool) {
		promptMessage(
			'JWS UPLOADER', 
			'Awaiting permission to post...', 
		);

		await timeout(2000);
		$('#promptModal').modal('hide');
		$('#btnPost').trigger('click');
		
		return false;
	}

	if (SAPObjArr.length !== 0) {
		await sendPostingStatus(true);

		isPosting = true;
		prepProgressBar();

		let count = 0, fullCount = SAPObjArr.length;

		for (SAPObj of SAPObjArr) {
			count++;
			progressBar(count, fullCount);
			try {
				await postToARInvoice(SAPObj)
				.then(res => {
					if (!res.valid) 
						throw new SAPError(resObj.msg);
					
				}).catch(async err => {
					await sendPostingStatus(false);
					throw new Error('net::ERR_CONNECTION_RESET');
				})
			} catch (err) {
				await sendPostingStatus(false);

				const checkIfPostingBool2 = await checkIfPosting();

				if (!checkIfPostingBool2) {
					console.log('Disconnecting DIAPI...');
					promptMessage(
						'JWS Uploader', 
						'Optimizing JWS memory usage...'
					)
					await disconnectDIAPI();
					$('#promptModal').modal('hide');
				} else {
					console.log('Someone is currently posting, cannot disconnect DIAPI.');
				}

				remProgressBar();
				portalMessage(err.name + ': ' + err.message, 'red', 'white');
				isPosting = false;
				$('#btnPost').removeAttr('disabled');

				promptMessage1Button(
					'JWS Uploader', 
					'Posting Process complete.', 
					'Ok'
				)

				return false;
			}
			
		}

		await sendPostingStatus(false);

		const checkIfPostingBool2 = await checkIfPosting();

		if (!checkIfPostingBool2) {
			console.log('Disconnecting DIAPI...');
			promptMessage(
				'JWS Uploader', 
				'Optimizing JWS memory usage...'
			)
			await disconnectDIAPI();
			$('#promptModal').modal('hide');
		} else {
			console.log('Someone is currently posting, cannot disconnect DIAPI.');
		}

		promptMessage1Button(
			'JWS Uploader', 
			'Posting Process complete.', 
			'Ok'
		)

		remProgressBar();
		portalMessage('OPERATION COMPLETED SUCCESFULLY', '#00FF7F', 'black');
		// resetState();
		isPosting = false;
	}
}

async function postToARInvoice(SAPObj) {
	console.log(SAPObj)
	let branchId = Number($('#selBranchName').val());
	let txtSalesEmpCode = -1;
	let txtOwnerCode = objSession.UserId;
	let txtJournalMemo = toObjectTableName + ' - ' + SAPObj.cardCode;
	let serviceType = 'I';
	console.log('trying to add...')
	const result = await $.ajax({
        type: 'POST',
        url: '../proc/exec/exec_add_' + mainFileName + '.php',
		data: 
		{
			SAPObj: JSON.stringify(SAPObj),
			txtSalesEmpCode : txtSalesEmpCode,
			txtOwnerCode : txtOwnerCode,
			branchId: branchId,
			txtJournalMemo : txtJournalMemo,
			serviceType : serviceType
        },
    });
    console.log(result)
    let resObj = JSON.parse(result)
    if (!resObj.valid)
    	console.log(result);

	return JSON.parse(result);
}

async function isFileReportFormatValid(excelRows){
	let count = 0, lineRow = 0;
	let validationResult = $('#txtFileReportValidation');
	for (item of excelRows) {
		if (count === 0) {
			count++;
			continue;
		} else if (count === 1) {
			for (prop in item) {
				let reportType = item[propRaw].trim().toLowerCase();
				if (reportType.search(titleName.toLowerCase()) === -1){
					validationResult.val('INVALID REPORT TYPE');
					validationResult.attr('title', 'Missing Title Report: ' + titleName);
					validationResult.addClass('border border-danger');
					portalMessage('Missing Title Report: ' + titleName, 'red', 'white');
					return false;
				} else {
					validationResult.val('Valid format: ' + titleName);
					validationResult.attr('title', reportType);
					validationResult.addClass('border border-success');
					count++;
					break;
				}
			}
			continue;
		} else if (count === 2) {
			for (prop in item) {
				let reportType = item[propRaw].trim().toLowerCase();
				if (reportType.search('period') === -1){
					validationResult.val('MISSING PART OF REPORT');
					validationResult.attr('title', 'Missing part of Report: For the period of [date range]');
					validationResult.addClass('border border-danger');
					portalMessage('Missing part of Report: For the period of [date range]', 'red', 'white');
					return false;
				} else {
					count++;
					break;
				}
			}
			continue;
		} else if (count === 3) {
			for (prop in item) {
				let reportType = item[propRaw].trim().toLowerCase();
				if (reportType.search('date') === -1){
					validationResult.val('MISSING PART OF REPORT');
					validationResult.attr('title', 'Missing part of Report: Date header');
					validationResult.addClass('border border-danger');
					portalMessage('Missing part of Report: Date header', 'red', 'white');
					return false;
				} else {
					count++;
					break;
				}
			}
			continue;
		} else if (count === 4) {
			for (prop in item) {
				let reportType = String(item[propRaw]).trim().toLowerCase();
				if (reportType.search('total') === -1) {
					lineRow++;
					if (Boolean(new Date((item[propRaw] - 25569) * 86400 * 1000) == 'Invalid Date')){
						validationResult.val('INVALID LINE DATE FORMAT');
						validationResult.attr('title', 'Cannot read some date in rows');
						validationResult.addClass('border border-danger');
						portalMessage('Invalid Date format on line '+ lineRow, 'red', 'white');
						return false;
					} else {
						break;
					}
				} else {
					break;
				}
			}
			continue;
		}
		
	}
	return true;
}

async function objValidation(subject, obj) {
	let data = await $.ajax({
		type: 'POST',
		url: '../proc/views/vw_addOnValidation.php',
		data: {
			obj: JSON.stringify(obj),
			subject: subject
		}
	});
	return JSON.parse(data);
}

async function primValidation(subject, primValue) {
	let data = await $.ajax({
		type: 'POST',
		url: '../proc/views/vw_addOnValidation.php',
		data: {
			primValue: primValue,
			subject: subject
		}
	});
	return JSON.parse(data);
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

////////UTILS//////////
/******Progress Bar******/
function resetState(resetChooseFile = true){
	$('#uploadResult').addClass('d-none');
	$('#btnPost').attr('disabled', true);
	$('#btnBrowse').removeAttr('disabled');
	$('#tblUploadResult > tbody, #tblUploadResult > thead tr').html('');
	$('#selBranchName').val('');
	$('#txtDetected').addClass('d-none');
	if (resetChooseFile) 
		$("#chooseFile").val('');
	$('#txtFileReportValidation').removeClass('border border-danger border-success').val('');
	$('#txtFiletoUpload').removeAttr('title');
	$("#btnExcelDownload").parent().addClass('d-none');
	$("#btnExcelDownload").text('Preparing Excel file to download...');
	$("#btnExcelDownload").attr('disabled', true);
	$("#countDisplay").addClass('d-none');
}

function showLoadingBar(){
	$('#loadingDiv').removeClass('d-none');
	$('#loadingText').html('0%');
}

function hideLoadingBar(){
	$('#loadingDiv').addClass('d-none');
	let loadingBar = $('#loadingBar');
	loadingBar.css('width', '0%');
}

async function loadingBar(count, fullCount, customText, isInfo = false) {
	let loadingBar = $('#loadingBar');
	let loadingText = $('#loadingText');
	loadingBar.css('width', (count/fullCount) * 100 + '%');
	if (!isInfo)
		loadingText.html(customText + Math.floor((count/fullCount) * 100) +'%');
	else
		loadingText.html(customText);

	if (isInfo)
		loadingBar.css('background-color', 'blue');
	else
		loadingBar.css('background-color', 'green');

	return true;
}

async function progressBar(count, fullCount, customText = '') {
	let progressBar = $('#progressBar');
	let progressText = $('#progressText');
	progressBar.css('width', (count/fullCount) * 100 + '%');
	if (customText === '')
		progressText.html('ADDING  ' + count + '  OUT OF  ' + fullCount);
	else
		progressText.html(customText + ' ' + Math.floor((count/fullCount) * 100) + '%');
}

function prepProgressBar(){
	$('#btnPost').attr('disabled', true);
	$('#btnBrowse').attr('disabled', true);
	$('#btnCancel').attr('disabled', true);
	$('#messageBar2').addClass('d-none');
	$('#progressDiv').removeClass('d-none');
}

function remProgressBar(){
	$('#btnBrowse').removeAttr('disabled');
	$('#btnCancel').removeAttr('disabled');
	$('#messageBar2').removeClass('d-none');
	$('#progressDiv').addClass('d-none');
}

/******DateFormatting Function******/
function SAPDateFormater(dateLiteral, checkDate = false) {
	
	let options = [
		{args: {year: '2-digit', month: '2-digit', day: '2-digit'}, order: [2,0,4]},
		{args: {year: 'numeric', month: '2-digit', day: '2-digit'}, order: [2,0,4]},
		{args: {year: '2-digit', month: '2-digit', day: '2-digit'}, order: [0,2,4]},
		{args: {year: 'numeric', month: '2-digit', day: '2-digit'}, order: [0,2,4]},
		{args: {year: 'numeric', month: '2-digit', day: '2-digit'}, order: [4,0,2]},
		{args: {year: 'numeric', month: 'long', day: '2-digit'}, order: [2,0,4]},
		{args: {year: '2-digit', month: '2-digit', day: '2-digit'}, order: [4,0,2]}
	];

	dateLiteral = SAPDateFormat == 6 && dateLiteral.length == 8 ? '20'+dateLiteral : dateLiteral;
	
	let dateObj;

	try {
		let passDate = new Date(dateLiteral);

		if (passDate == 'Invalid Date')
			throw {message: `Invalid date format. Cannot parse date value from string "${dateLiteral}"`};

		let minDate = new Date('01-01-2018');
		let maxDate = new Date('12-31-2050');

		if (checkDate) {
			if (passDate >= minDate && passDate <= maxDate) {
				dateObj = new Intl.DateTimeFormat('en-us', options[SAPDateFormat].args).formatToParts(passDate);
			} else {
				throw {message: `Out of valid date range. The date should be in the range of 01-01-2018 and 12-31-2050.`};
			}
		} else {
			dateObj = new Intl.DateTimeFormat('en-us', options[SAPDateFormat].args).formatToParts(passDate);
		}
		
	}
	catch(err) {
		return {bool: false, error: err.message};
	}
	let dateStr = `${dateObj[options[SAPDateFormat].order[0]].value}.${dateObj[options[SAPDateFormat].order[1]].value}.${dateObj[options[SAPDateFormat].order[2]].value}`;
	return {bool: true, value: dateStr};
}

function SQLDateFormater(dateLiteral) {
	if (dateLiteral == '') {
		return '';
	}

	let dateObj = new Intl.DateTimeFormat('en-us', {year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(new Date(dateLiteral));

	return `${dateObj[4].value}-${dateObj[0].value}-${dateObj[2].value}`;
}

$('#pageTitle').text(`${titleName} | SAP B1`);

function portalMessage(message, bgColor, textColor){
	$('#messageBar2').addClass('d-none');
	$('#messageBar3').removeClass('d-none');
	$('#messageBar').text(message).css({'background-color': bgColor, 'color': textColor});
	
	setTimeout(function()
	{
		$('#messageBar').text('').css({'background-color': '', 'color': ''});	
		$('#messageBar2').removeClass('d-none');
	},5000)
}

$(document.body).on('click','#btnCancel',function()
{
	window.location.replace('../../dashboard/templates/dashboard.php')

})
$(document.body).on('click', '#btnLogout', function () 
{
	$('#logoutModal').modal('show');
});
$(document.body).on('click', '#btnLogoutConfirm', function () 
{
	$('#logoutModal').modal('hide');
	$.ajax({
		type: 'GET',
		url: '../proc/views/utilities/vw_logout.php',
		success: function (html) 
		{
			window.location.reload();
		}
	}); 
});

async function promptMessage2Buttons(title, message, button1Label, button2Label, callback, info = '') {
	$('#promptTitle').html(title);
	$('#promptMessage').html(message);
	if (info !== '') {
		$('#promptInfo').removeClass('d-none');
		$('#promptInfo').html(info);
	} else
		$('#promptInfo').addClass('d-none');

	$('#btnPrompt1').removeClass('d-none');
	$('#btnPrompt1').html(button1Label);
	$('#btnPrompt2').removeClass('d-none');
	$('#btnPrompt2').html(button2Label);
	$('#promptModal').modal('show');

	$('#btnPrompt1').off('click').click(async function(){
		callback();
	});

	$('#btnPrompt2').off('click');
}

async function promptMessage2Buttons2ReturnBools(title, message, button1Label, button2Label, callback, prop = {}, info = '') {
	$('#btnPrompt1').off('click');
	$('#btnPrompt2').off('click');
	$('#promptTitle').html(title);
	$('#promptMessage').html(message);
	if (info !== '') {
		$('#promptInfo').removeClass('d-none');
		$('#promptInfo').html(info);
	} else
		$('#promptInfo').addClass('d-none');

	$('#btnPrompt1').removeClass('d-none');
	$('#btnPrompt1').html(button1Label);
	$('#btnPrompt2').removeClass('d-none');
	$('#btnPrompt2').html(button2Label);
	$('#promptModal').modal('show');

	$('#btnPrompt1').click(async function(){
		if (Object.keys(prop).length)
			callback(true, prop);
		else
			callback(true);
	});

	$('#btnPrompt2').click(async function(){
		if (Object.keys(prop).length)
			callback(false, prop);
		else
			callback(false);
	});
}

async function promptMessage1Button1ReturnBool(title, message, button1Label, callback, prop = {}, info = '') {
	$('#promptTitle').html(title);
	$('#promptMessage').html(message);
	if (info !== '') {
		$('#promptInfo').html(info);
		$('#promptInfo').removeClass('d-none');
	} else {
		$('#promptInfo').addClass('d-none');
	}

	$('#btnPrompt1').removeClass('d-none');
	$('#btnPrompt1').html(button1Label);

	if (!$('#btnPrompt2').hasClass('d-none'))
		$('#btnPrompt2').addClass('d-none');

	$('#promptModal').modal('show');

	$('#btnPrompt1').off('click').click(() => {
		if (Object.keys(prop).length) {
			callback(prop);
		} else {
			callback();
		}
	});
}

function promptMessage1Button(title, message, button1Label, info = '') {
	$('#promptTitle').html(title);
	$('#promptMessage').html(message);
	if (info !== ''){
		$('#promptInfo').html(info);
		$('#promptInfo').removeClass('d-none');
	}
	else {
		if (!$('#promptInfo').hasClass('d-none'))
			$('#promptInfo').addClass('d-none');
	}

	$('#btnPrompt1').removeClass('d-none');
	$('#btnPrompt1').html(button1Label);

	if (!$('#btnPrompt2').hasClass('d-none'))
		$('#btnPrompt2').addClass('d-none');

	$('#promptModal').modal('show');

	$('#btnPrompt1').off('click').click(function(){
		$('#promptModal').modal('hide');
		setTimeout(() => {
			$('#btnPrompt2').removeClass('d-none');
			$('#promptInfo').removeClass('d-none');
		}, 200);
	});
}

async function canPost() {
	return await fetch('http://'+serverIP+':3003/canPost')
	.then(res => res.json())
	.then(data => data);
}

async function sendPostingStatus(bool) {
	return await fetch('http://'+serverIP+':3003/postingStatus',
	{
	    method: 'post',
	    headers: {
	      'Content-Type': 'application/json'
	    },
	    body: JSON.stringify({bool: bool, type: 'jws'})
	}).then(res => res.json());
}

function FormatMoney(amount){
	let preAmount = accounting.formatMoney(amount, "", 2);
	return preAmount;
}

function promptMessage(title, message, info = '') {
	$('#promptTitle').html(title);
	$('#promptMessage').html(message);
	if (info !== ''){
		$('#promptInfo').html(info);
		$('#promptInfo').removeClass('d-none');
	}
	else {
		if (!$('#promptInfo').hasClass('d-none'))
			$('#promptInfo').addClass('d-none');
	}

	if (!$('#btnPrompt1').hasClass('d-none'))
		$('#btnPrompt1').addClass('d-none');

	if (!$('#btnPrompt2').hasClass('d-none'))
		$('#btnPrompt2').addClass('d-none');

	$('#promptModal').modal('show');

	$('#btnPrompt1').off('click');
}

async function hasEnoughFreeMem() {
	return await fetch('http://'+serverIP+':3003/hasEnoughFreeMem')
	.then(res => res.json())
	.then(data => data);
}

async function checkIfPosting() {
	return await fetch('http://'+serverIP+':3003/checkIfPosting')
	.then(res => res.json())
	.then(data => data);
}

async function disconnectDIAPI() {
	const result = await $.ajax({
        type: 'GET',
        url: '../proc/views/utilities/vw_disconnectDIAPI.php'
    });

	return JSON.parse(result);
}


});