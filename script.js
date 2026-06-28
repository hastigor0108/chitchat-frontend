const SECRET_CODE = "scode";

/* LOGIN */
function enterChat(){

let name = document.getElementById("name").value.trim();
let code = document.getElementById("invite").value.trim();

if(!name){
alert("Enter name 💌");
return;
}

if(code !== SECRET_CODE){
alert("Wrong invite code ❌");
return;
}

sessionStorage.setItem("user", name);
window.location = "chat.html";

}

/* CHAT INIT */
let socket = null;

if(window.location.pathname.includes("chat.html")){

socket = io("https://chitchat-backend-ieyw.onrender.com");

let user = sessionStorage.getItem("user");

if(!user){
window.location = "index.html";
}

/* show name */
document.getElementById("userName").innerText = user;

/* receive */
socket.on("receive-message", (data)=>{
addMessage(data);
});

/* typing */
socket.on("typing", (data)=>{

if(data.user === user) return;

let box = document.getElementById("typing");
box.innerHTML = `${data.user} is typing...`;

setTimeout(()=> box.innerHTML="", 1000);

});

/* input typing emit */
document.getElementById("msg").addEventListener("input", ()=>{
socket.emit("typing", { user });
});

}

/* SEND */
function sendMessage(){

let input = document.getElementById("msg");
let text = input.value.trim();

if(!text || !socket) return;

let user = sessionStorage.getItem("user");

socket.emit("send-message", {
user,
message: text,
time: new Date().toLocaleTimeString()
});

input.value = "";

}

/* ADD MESSAGE */
function addMessage(data){

let box = document.getElementById("messages");
let current = sessionStorage.getItem("user");

let div = document.createElement("div");
div.className = "bubble " + (data.user === current ? "right" : "left");

div.innerHTML = `
<b>${data.user}</b><br>
${data.message}<br>
<small>${data.time}</small>
`;

box.appendChild(div);
box.scrollTop = box.scrollHeight;

}

/* CLEAR */
function clearChat(){
document.getElementById("messages").innerHTML = "";
}
