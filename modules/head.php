<!DOCTYPE html>
<html lang="en" style="">

<head>

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="description" content="">
  <meta name="author" content="">

  <title id="pageTitle">SAP Business One</title>

  <!-- Custom fonts for this template-->
  <link href="../../../vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
  <link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">

  <!-- Custom styles for this template-->
  <link href="../../../css/sb-admin-2.min.css" rel="stylesheet">
  <!-- MDBootstrap Datatables  -->
  <link href="../../../css/addons/datatables2.min.css" rel="stylesheet">

  
	<!-- Bootstrap core JavaScript-->
  <script src="../../../js/jquery-3.5.1.min.js"></script>
  <!-- for parsing Excel files -->
  <script src="../../../js/xlsx.full.min.js"></script>
  <!-- for converting html table to excel file -->
  <script src="../../../js/fileSaver.js"></script>
   <!-- Context -->
  <script src="../../../js/ctxMenu/ctxMenu/ctxMenu.js"></script>

  <!-- Own CSS  -->
  <link href="../../../css/custom.css" rel="stylesheet">
  <link href="../../../css/theme/default.css" rel="stylesheet"  id="themeStylesheetLink">
 
  
  <!--Data tables -->
  <link rel="stylesheet" type="text/css" href="../../../js/DataTables/datatables.min.css"/>
  <script type="text/javascript" src="../../../js/DataTables/datatables.min.js"></script>
  <!--Accounting -->
  <script type="text/javascript" src="../../../js/accounting/accounting.min.js"></script>
  
  <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.10.8/xlsx.full.min.js"></script>
  
</head>

<body id="body" style="100vh; margin-bottom:100px; -moz-transform: scale(0.7, 0.7); /* Moz-browsers */
    zoom: 0.7; /* Other non-webkit browsers */
    zoom: 55%; /* Webkit browsers */
  



">
<script>
  function initThemeSelector(){
        const themeSelect = document.getElementById("themeSelect");
        const themeStylesheetLink  = document.getElementById("themeStylesheetLink");


        function activateTheme(themeName){
          themeStylesheetLink.setAttribute("href", 'css/${themeName}.css');
        }
        themeSelect.addEventListener("change", () => {
          activateTheme(themeSelect.value);

        });

  }
    initThemeSelector();
 </script>
		
		