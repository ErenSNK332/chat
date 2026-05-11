// CONFIG SUPABASE
const SUPABASE_URL = "https://cgsdayvwkqlddhlzgpjo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnc2RheXZ3a3FsZGRobHpncGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTIzMzUsImV4cCI6MjA5NDA2ODMzNX0.HcAuU-rjo8Z5FaEg8l_T3ZnjLCLEGHovu8AEspx2b_A";

const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json"
};

// LOGIN
async function login() {
    const username = document.getElementById("username").value.trim();
    const code = document.getElementById("code").value.trim();
    const error = document.getElementById("error");

    if (!username || !code) {
        error.textContent = "Remplis tout.";
        return;
    }

    // ADMIN
    if (username === "admin" && code === "admin123") {
        localStorage.setItem("user", JSON.stringify({ username, is_admin: true }));
        window.location.href = "chat.html";
        return;
    }

    // UTILISATEUR NORMAL
    if (code !== "1234") {
        error.textContent = "Code incorrect.";
        return;
    }

    // Vérifier si l'utilisateur existe
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${username}`, { headers });
    const data = await res.json();

    if (data.length === 0) {
        // Créer l'utilisateur
        await fetch(`${SUPABASE_URL}/rest/v1/users`, {
            method: "POST",
            headers,
            body: JSON.stringify({ username })
        });
    }

    localStorage.setItem("user", JSON.stringify({ username, is_admin: false }));
    window.location.href = "chat.html";
}

// CHAT PAGE
async function loadMessages() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=*`, { headers });
    const messages = await res.json();

    const box = document.getElementById("messages");
    box.innerHTML = "";

    messages.forEach(msg => {
        const div = document.createElement("div");
        div.classList.add("message");
        div.textContent = msg.content;
        box.appendChild(div);
    });
}

async function sendMessage() {
    const user = JSON.parse(localStorage.getItem("user"));
    const text = document.getElementById("msgInput").value.trim();
    if (!text) return;

    await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            content: `${user.username}: ${text}`
        })
    });

    document.getElementById("msgInput").value = "";
    loadMessages();
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

// AUTO-LOAD
if (window.location.pathname.includes("chat.html")) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) window.location.href = "index.html";

    document.getElementById("userDisplay").textContent = "Connecté : " + user.username;

    loadMessages();
    setInterval(loadMessages, 2000);
}
