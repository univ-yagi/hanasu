let headerHeight = $("h1").height();
let windowWidth = $(window).width();
let windowHeight = $(window).height();
let element = $("#my-video");

element.css({
	'height': windowHeight-headerHeight,
});

let elementWidth = element.width();
let elementHeight = element.height();

if(windowWidth < elementWidth) {
	element.css({
		'left' : -element.width()/4,
	});
}

function noScroll(event) {
	event.preventDefault();
}
document.addEventListener('touchmove', noScroll, { passive: false });
document.addEventListener('mousewheel', noScroll, { passive: false });