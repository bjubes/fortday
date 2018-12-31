var socket = io();


let dpi = window.devicePixelRatio;
let canvas = document.getElementById('ctx');
let ctx = canvas.getContext('2d');

function fix_dpi() {
	let style_height = 500
	let style_width = 500

	//scale the canvas
	canvas.setAttribute('height', style_height * dpi);
	canvas.setAttribute('width', style_width * dpi);

}

fix_dpi()
var size = 64;
var reachDistance = 75;