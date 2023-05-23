/*$(document).ready(function () {
	//let theme = $('#theme').text();
//if (theme == 1){
	
}
//else if (theme == 2){
	$('#body').css('background-image', 'linear-gradient(to right bottom, #f2f7f8, #b5eafc, #bfebe0)');
}
	
});


$(document).ready(function(){
	
	switchColorTheme();
});
$(window).on('load', function(){
	checkTheme();
});
function checkTheme() {
	let currentThemecolor = localStorage.getItem('theme-colors'); 

	if (currentThemecolor !== null) {

		$('body').addClass(currentThemecolor);
		$('#${currentThemecolor}').addClass('active');

	}
}
function switchColorTheme() {

	$('.theme-buttons div').click(function(){

		const ctheme = $(this).attr('id');

		$('.theme-buttons div').removeClass('active');
		$(this).addClass('active');

		removedThemeClasses();
		 $('body').addClass(ctheme);
		 localStorage.setItem('theme-colors', ctheme);
	});
}
function removedThemeClasses(){

}
*/






	/*let theme = document.querySelectorAll('#theme-color');

themecolor.forEach(color => 

	color.addEventListener('click'), () =>{
			let datacolor = color.getAttribute('data-color');
			document.querySelector(':root').style.setProperty('--main-color', datacolor);
			
		
}); */

