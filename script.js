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
    transports: ["polling", "websocket"],
    reconnection: true
  });

  socket.on("connect", () => {

    console.log("CONNECTED:", socket.id);

    socketReady = true;

    room = sessionStorage.getItem("invite");

    if (room) {
      socket.emit("join-room", room);
      console.log("JOINED ROOM:", room);
    }
  });

  socket.on("connect_error", (err) => {
    console.log("CONNECT ERROR:", err.message);
  });

  socket.on("receive-message", (data) => {
    addMessage(data);
  });

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

  if (!name) {
    alert("Enter name 💌");
    return;
  }

  if (code !== SECRET_CODE) {
    alert("Wrong invite code ❌");
    return;
  }

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

/* SEND MESSAGE (SAFE) */
function sendMessage() {

  console.log("SEND CLICKED");

  if (!socketReady || !socket) {
    console.log("Socket not ready");
    return;
  }

  let input = document.getElementById("msg");
  let text = input.value.trim();

  if (!text) return;

  let user = sessionStorage.getItem("user");
  room = sessionStorage.getItem("invite");

  if (!room) {
    console.log("No room found");
    return;
  }

  socket.emit("send-message", {
    user,
    message: text,
    time: new Date().toLocaleTimeString(),
    room: room
  });

  input.value = "";
}

/* SHOW MESSAGE */
function addMessage(data) {

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
function clearChat() {
  document.getElementById("messages").innerHTML = "";
}
