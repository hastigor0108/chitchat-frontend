const SECRET_CODE = "2110";

let socket = null;
let room = null;

/* SOCKET */
function initSocket() {

  if (typeof io === "undefined") {
    console.log("io not loaded");
    return;
  }

  socket = io("https://chitchat-backend-ieyw.onrender.com", {
    transports: ["polling"]
  });

  socket.on("connect", () => {

    console.log("CONNECTED:", socket.id);

    room = sessionStorage.getItem("invite");

    if (room) {
      socket.emit("join-room", room);
    }

  });

  socket.on("receive-message", (data) => {
    addMessage(data);
  });

  socket.on("chat-history", (messages) => {
    document.getElementById("messages").innerHTML = "";

    messages.forEach(addMessage);
  });

}

initSocket();

/* LOGIN */
function enterChat() {

  let name =
    document.getElementById("name").value.trim();

  let code =
    document.getElementById("invite").value.trim();

  if (!name) {
    alert("Enter name");
    return;
  }

  if (code !== SECRET_CODE) {
    alert("Wrong code");
    return;
  }

  sessionStorage.setItem("user", name);
  sessionStorage.setItem("invite", code);

  location.href = "chat.html";

}

/* CHAT PAGE */
if (
window.location.pathname.includes("chat.html")
) {

  let user =
    sessionStorage.getItem("user");

  if (!user) {
    location.href = "index.html";
  }

  document.getElementById(
    "userName"
  ).innerText = user;

}

/* SEND */
function sendMessage() {

  if (!socket) {
    console.log("NO SOCKET");
    return;
  }

  let input =
    document.getElementById("msg");

  let text =
    input.value.trim();

  if (!text) return;

  socket.emit(
    "send-message",
    {
      room:
        sessionStorage.getItem("invite"),

      user:
        sessionStorage.getItem("user"),

      message:
        text,

      time:
        new Date()
        .toLocaleTimeString()
    }
  );

  input.value = "";

}

/* UI */
function addMessage(data) {

let box =
document.getElementById("messages");

if(!box) return;

let div =
document.createElement("div");

div.innerHTML = `
<b>${data.user}</b><br>
${data.message}
`;

box.appendChild(div);

box.scrollTop =
box.scrollHeight;

}

function clearChat() {
document.getElementById(
"messages"
).innerHTML = "";
}
