$(window).keydown(function (e) 
	{
	if (e.keyCode == 13) 
	{
		$( "#btnLogin" ).trigger( "click" );
	}
	
});

$(document).ready(function() 
{
	
	//Matrix Cell Effects
	
	$(document.body).on('focus', 'input, select, textarea', function (){
		
		$(this).css({'outline': 'none', 'background-color': '#fdfd96'});
		//$(this).closest('td').css('background-color', '#fdfd96');
		$(this).closest('span').show();
	
		
	});
	$(document.body).on('blur', 'input, select, textarea', function (){
		$(this).css({'outline': 'none', 'background-color': ''});
		//$(this).closest('td').css('background-color', '');
		$(this).closest('span').hide();
		
	});
	$(document.body).on('click', 'button', function (){
		
		$(this).removeClass('d-none');
		$(this).siblings('input').focus();
	});
	$(document.body).on('click', '#btnExit', function (){
		setTimeout(function () 
				{
					window.close();
				}, 1000) 
		
	});
	
	
	$(document.body).on('click', '#btnLogin', function () 
	{
		
		var err = 0;
    	var errmsg = '';
		var selCompany = $('select#selCompany').val();
    	var txtUsername = $('input#txtUsername').val();
    	var txtPassword = $('input#txtPassword').val();
		
		
		if(err == 0)
		{
			$.ajax({
                type: 'POST',
                url: 'proc/exec/exec-login-users.php',
                data: 
				{
						selCompany : selCompany,
                		txtUsername : txtUsername,
                		txtPassword : txtPassword
				},
                success: function(html)
				{
					res = html.split('*');
					
					
					if(res[0] == 'true')
					{
						$('#messageBar2').addClass('d-none');
						$('#messageBar3').removeClass('d-none');
						$('#messageBar').text('Successfully Logged In!').css({'background-color': '#00FF7F', 'color': 'black'});
						
						
							setTimeout(function()
							{
								$('#messageBar').text('').css({'background-color': '', 'color': ''});	
								
							window.location.replace("../dashboard/templates/dashboard.php");
							},3000)
					}
					else
					{
						$('#messageBar2').addClass('d-none');
						$('#messageBar3').removeClass('d-none');
						$('#messageBar').text('Enter valid Username and Password!').css({'background-color': 'red', 'color': 'white'});
						
							setTimeout(function()
							{
								$('#messageBar').text('').css({'background-color': '', 'color': ''});	
								
							},5000)
					}
					

                },
                error: function()
				{
					//showAlert('alert-danger animated bounceIn', 'Something went wrong!');
				},
                beforeSend:function()
				{
                   //showAlert('alert-success animated bounceIn', 'Authenticating. Please wait...');
                }
            });
    	}
		else
		{
			alert('fail2');
    	}
		
    });
	   
		
});



