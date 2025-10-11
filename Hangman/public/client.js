const socket = io();

const joinDiv = document.getElementById("joinDiv");
const gameDiv = document.getElementById("game");
const joinBtn = document.getElementById("joinBtn");
const nameInput = document.getElementById("nameInput");
const roomInput = document.getElementById("roomInput");

const playersList = document.getElementById("playersList");
const wordDisplay = document.getElementById("wordDisplay");
const letterInput = document.getElementById("letterInput");
const guessBtn = document.getElementById("guessBtn");
const wrongGuessesSpan = document.getElementById("wrongGuesses");
const status = document.getElementById("status");

const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

// Join room
joinBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const room = roomInput.value.trim();
    if (!name || !room) return alert("Enter name and room");
    joinDiv.style.display = "none";
    gameDiv.style.display = "block";

    socket.emit("joinRoom", { name, room });
});

// Handle chat
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = chatInput.value.trim();
    if (!msg) return;
    socket.emit("chatMessage", { msg });
    chatInput.value = "";
});

// Handle guess
guessBtn.addEventListener("click", () => {
    const letter = letterInput.value.trim();
    if (!letter) return;
    socket.emit("guessLetter", { letter });
    letterInput.value = "";
});

// Socket listeners
socket.on("systemMessage", (msg) => {
    const p = document.createElement("p");
    p.style.fontStyle = "italic";
    p.textContent = msg;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on("chatMessage", ({ name, msg }) => {
    const p = document.createElement("p");
    p.innerHTML = `<strong>${name}:</strong> ${msg}`;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on("updatePlayers", (players) => {
    playersList.innerHTML = "";
    players.forEach(p => {
        const li = document.createElement("li");
        li.textContent = p;
        playersList.appendChild(li);
    });
});

socket.on("updateGame", (roomData) => {
    const display = roomData.word.split("").map(l => (
        roomData.guessedLetters.includes(l) ? l : "_"
    )).join(" ");
    wordDisplay.textContent = display;

    wrongGuessesSpan.textContent = roomData.wrongGuesses;

    if (!display.includes("_")) {
        status.textContent = "🎉 You won!";
    } else if (roomData.wrongGuesses >= 6) {
        status.textContent = `💀 You lost! Word was: ${roomData.word}`;
    } else {
        status.textContent = "";
    }
});