import React, { useState } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const BACKEND = "http://127.0.0.1:8001";

  // 🔥 LOGIN
  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 LOGOUT
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setMessages([]);
  };

  // 🔥 CHAT
  const sendQuery = async () => {
    if (!query) return;

    const userMsg = { type: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: user.email,
          query: query,
        }),
      });

      const data = await res.json();

      const botMsg = { type: "bot", text: data.response };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Server error" },
      ]);
    }

    setLoading(false);
  };

  // 🔥 FILE UPLOAD
  const uploadFile = async () => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${BACKEND}/upload-fir`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { type: "bot", text: data.response },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Upload failed" },
      ]);
    }

    setLoading(false);
  };

  // 🔥 UI
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      
      {/* SIDEBAR */}
      <div
        style={{
          width: "260px",
          background: "#1a1a1a",
          color: "white",
          padding: "20px",
        }}
      >
        <h2>⚖️ LegalAI</h2>

        {!user ? (
          <button onClick={login} style={btnStyle}>
            Login with Google
          </button>
        ) : (
          <>
            <p style={{ fontSize: "14px" }}>{user.email}</p>
            <button onClick={logout} style={btnStyle}>
              Logout
            </button>
          </>
        )}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* CHAT WINDOW */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            background: "#f5f5f5",
          }}
        >
          {!user && (
            <p style={{ textAlign: "center", marginTop: "50px" }}>
              🔒 Please login to use LegalAI
            </p>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                textAlign: msg.type === "user" ? "right" : "left",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "10px",
                  borderRadius: "12px",
                  background:
                    msg.type === "user" ? "#007bff" : "#e0e0e0",
                  color: msg.type === "user" ? "white" : "black",
                  maxWidth: "60%",
                }}
              >
                {msg.text}
              </span>
            </div>
          ))}

          {loading && <p>⚖️ Thinking...</p>}
        </div>

        {/* INPUT AREA */}
        {user && (
          <div
            style={{
              padding: "15px",
              borderTop: "1px solid #ccc",
              display: "flex",
              gap: "10px",
            }}
          >
            <input
              style={inputStyle}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your legal issue..."
            />

            <button onClick={sendQuery} style={btnStyle}>
              Send
            </button>

            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <button onClick={uploadFile} style={btnStyle}>
              Upload FIR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 🔥 STYLES
const btnStyle = {
  padding: "10px",
  background: "#333",
  color: "white",
  border: "none",
  cursor: "pointer",
  borderRadius: "5px",
};

const inputStyle = {
  flex: 1,
  padding: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

export default App;