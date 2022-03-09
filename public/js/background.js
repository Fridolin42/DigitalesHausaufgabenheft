console.log("Starting background...");
let canvas;
let ctx;
let height;
let width;

let mouseX = 0;
let mouseY = 0;
let x = 0;
let y = 0;

function init() {
    canvas = document.getElementById("background");
    ctx = canvas.getContext("2d");
    canvas.height = canvas.clientHeight
    canvas.width = canvas.clientWidth
    width = canvas.width;
    height = canvas.height;
}

init()

document.onmousemove = (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY
}

setInterval(() => {
    x += (mouseX - x)/8;
    y += (mouseY - y)/8;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "darkred";
    ctx.fill();
}, 25)