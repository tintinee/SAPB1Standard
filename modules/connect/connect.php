<?php

$vCmp=new COM("SAPbobsCOM.company") or die ("No connection");
	
$DbServerType = 10;
$server = 'LAPTOP-01G1JLEI';
$UseTrusted = false;
$DBusername = 'sa';
$DBpassword = 'SAPB1Admin';
$CompanyDB = $_SESSION['MSSQL_DB'];
$username = 'manager';
$password = 'sapb1';
$LicenseServer = "LAPTOP-01G1JLEI:30000";

?>

