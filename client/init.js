var socket = io();




//get DPI
let dpi = window.devicePixelRatio;
//get canvas
let canvas = document.getElementById('ctx');
//get context
let ctx = canvas.getContext('2d');
function fix_dpi() {
	//get CSS height
	//the + prefix casts it to an integer
	//the slice method gets rid of "px"
	let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
	//get CSS width
	let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
	//scale the canvas
	canvas.setAttribute('height', style_height * dpi);
	canvas.setAttribute('width', style_width * dpi);

}

var size = 64;
var reachDistance = 75