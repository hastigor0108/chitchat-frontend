const SECRET_CODE = "SHREE SHUBHAM GOR";

let socket = null;
let room = null;
let socketReady = false;

/* SAFE SOCKET INIT */
function initSocket() {

  if (typeof io === "undefined") {
    setTimeout(initSocket, 300);
    return;
  }

socket = io("https://chitchat-backend-ieyw.onrender.com", {
  transports: ["polling"],
  forceNew: true,
  reconnection: true
});

  socket.on("connect", () => {
  console.log("SOCKET CONNECTED ✔", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("SOCKET ERROR ❌", err.message);
});
  socket.on("receive-message", addMessage);

  socket.on("chat-history", (messages) => {
    messages.forEach(addMessage);
  });

  socket.on("typing", (data) => {
    let user = sessionStorage.getItem("user");
    if (data.user === user) return;

    let box = document.getElementById("typing");
    box.innerText = `${data.user} is typing...`;

    setTimeout(() => {
      box.innerText = "";
    }, 1000);
  });
}

initSocket();

/* LOGIN */
function enterChat() {

  let name = document.getElementById("name").value.trim();
  let code = document.getElementById("invite").value.trim();

  if (!name) return alert("Enter name 💌");

  if (code !== SECRET_CODE) return alert("Wrong invite code ❌");

  sessionStorage.setItem("user", name);
  sessionStorage.setItem("invite", code);

  window.location = "chat.html";
}

/* CHAT INIT */
if (window.location.pathname.includes("chat.html")) {

  let user = sessionStorage.getItem("user");
  room = sessionStorage.getItem("invite");

  if (!user || !room) {
    window.location = "index.html";
  }

  document.getElementById("userName").innerText = user;

  document.getElementById("msg").addEventListener("input", () => {
    if (socket) socket.emit("typing", { user });
  });

  document.getElementById("msg").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

/* SEND MESSAGE (FINAL SAFE) */
function sendMessage() {

  let input = document.getElementById("msg");
  if (!input) return;

  let text = input.value.trim();
  if (!text) return;

  if (!socketReady || !socket) {
    console.log("Socket not ready");
    return;
  }

  let user = sessionStorage.getItem("user");
  room = sessionStorage.getItem("invite");

  if (!room) return;

  socket.emit("send-message", {
    user,
    message: text,
    time: new Date().toLocaleTimeString(),
    room
  });

  input.value = "";
}

/* ADD MESSAGE */
function addMessage(data) {

  let box = document.getElementById("messages");
  if (!box) return;

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

/* CLEAR CHAT */
function clearChat() {
  let box = document.getElementById("messages");
  if (box) box.innerHTML = "";
}
