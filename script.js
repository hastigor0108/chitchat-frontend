const SECRET_CODE = "SHREE SHUBHAM GOR";

/* ROOM */
let room = null;

/* SOCKET */
let socket = io("https://chitchat-backend-ieyw.onrender.com", {
  transports: ["websocket", "polling"]
});

/* CONNECT */
socket.on("connect", () => {
  console.log("connected:", socket.id);

  if (room) {
    socket.emit("join-room", room);
  }
});

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

/* INIT CHAT PAGE */
if (window.location.pathname.includes("chat.html")) {

  let user = sessionStorage.getItem("user");
  room = sessionStorage.getItem("invite");

  if (!user || !room) {
    window.location = "index.html";
  }

  document.getElementById("userName").innerText = user;

  /* CHAT HISTORY */
  socket.on("chat-history", (messages) => {
    messages.forEach(addMessage);
  });

  /* RECEIVE MESSAGE */
  socket.on("receive-message", (data) => {
    addMessage(data);
  });

  /* TYPING */
  socket.on("typing", (data) => {
    if (data.user === user) return;

    let box = document.getElementById("typing");
    box.innerHTML = `${data.user} is typing...`;

    setTimeout(() => {
      box.innerHTML = "";
    }, 1000);
  });

  /* INPUT TYPING */
  document.getElementById("msg").addEventListener("input", () => {
    socket.emit("typing", { user });
  });

  /* ENTER KEY */
  document.getElementById("msg").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
}

/* SEND MESSAGE */
function sendMessage() {

  let input = document.getElementById("msg");
  let text = input.value.trim();

  if (!text) return;

  let user = sessionStorage.getItem("user");

  socket.emit("send-message", {
    user,
    message: text,
    time: new Date().toLocaleTimeString(),
    room: room
  });

  input.value = "";
}

/* ADD MESSAGE */
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

/* CLEAR CHAT */
function clearChat() {
  document.getElementById("messages").innerHTML = "";
}
