const SECRET_CODE = "2110";

let socket = null;
let room = null;
let socketReady = false;

/* SOCKET INIT */
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

  /* CONNECT */
  socket.on("connect", () => {

    console.log("SOCKET CONNECTED ✔", socket.id);

    socketReady = true;

    room = sessionStorage.getItem("invite");

    if (room) {
      console.log("JOIN ROOM:", room);
      socket.emit("join-room", room);
    } else {
      console.log("NO ROOM FOUND ❌");
    }
  });

  /* ERROR */
  socket.on("connect_error", (err) => {
    console.log("SOCKET ERROR ❌", err.message);
  });

  /* RECEIVE MESSAGE */
  socket.on("receive-message", (data) => {
    addMessage(data);
  });

  /* CHAT HISTORY */
  socket.on("chat-history", (messages) => {
    if (messages && Array.isArray(messages)) {
      messages.forEach(addMessage);
    }
  });

  /* TYPING */
  socket.on("typing", (data) => {

    let user = sessionStorage.getItem("user");
    if (data.user === user) return;

    let box = document.getElementById("typing");
    if (!box) return;

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

  /* typing emit */
  document.getElementById("msg").addEventListener("input", () => {
    if (socket && socketReady) {
      socket.emit("typing", { user });
    }
  });

  /* enter key */
  document.getElementById("msg").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

/* SEND MESSAGE */
function sendMessage() {

  let input = document.getElementById("msg");
  if (!input) return;

  let text = input.value.trim();
  if (!text) return;

  if (!socket || !socketReady) {
    console.log("Socket not ready ❌");
    return;
  }

  let user = sessionStorage.getItem("user");
  room = sessionStorage.getItem("invite");

  if (!room) {
    console.log("Room missing ❌");
    return;
  }

  console.log("SENDING MESSAGE ✔");

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
