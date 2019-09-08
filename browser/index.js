const canvas = document.querySelector("#glCanvas");

// initialize gl context
const gl = canvas.getContext("webgl");

// if the browser doesn't support WebGL, the variable would be null (returned by getContext())
if (!gl) {
    console.error("Unable to initialize WebGL. Your browser or machine may not support it.");
}


let exts = gl.getSupportedExtensions();

let string = '';
for (let e of exts) {

    string += (e + ', ');
}

document.getElementById("content1").innerHTML+="<p>"+string+"</p>";

let memory = navigator.deviceMemory;
document.getElementById("content2").innerHTML+="<p>This device has at least " + memory + "GiB of RAM.</p>";