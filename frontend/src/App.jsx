import { useEffect, useState } from "react";
import "./App.css";
const API_URL = "/api/chat";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState("");

  useEffect(() => {
    let id = localStorage.getItem("conversation_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("conversation_id", id);
    }
    setConversationId(id);
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setMessage("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message,
          role: "user",
          conversation_id: conversationId,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (err) {
      console.error(err);
      alert("Backend error");
    }
  };

  return (
    <div>
      <h2>DevChat</h2>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>


      <div className="input-area">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>


    </div>
  );
}

export default App;
