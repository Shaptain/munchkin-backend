import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:3001");

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
  }, []);

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:3001/login", { phone });
      if (res.data.success) {
        const msgRes = await axios.get("http://localhost:3001/messages");
        setMessages(msgRes.data);
        setLoggedIn(true);
      }
    } catch (err) {
      alert("this isn't for you 🤨");
    }
  };

  const sendMessage = () => {
    const newMsg = {
      sender: phone,
      text: message,
      image,
    };
    socket.emit("send_message", newMsg);
    setMessage("");
    setImage(null);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    if (file) reader.readAsDataURL(file);
  };

  if (!loggedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-pink-100">
        <div className="p-8 bg-white rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-bold">enter phone number...</h2>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="p-2 border rounded w-full"
            placeholder="XXXXXXXXXX"
          />
          <button
            onClick={login}
            className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-cover bg-center" style={{ backgroundImage: `url('/bg.jpg')` }}>

      <div className="h-full bg-white bg-opacity-80 flex flex-col justify-between p-4">
        <div className="overflow-y-auto flex-1 mb-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`my-2 flex ${msg.sender === phone ? "justify-end" : "justify-start"}`}>
              <div className={`p-3 rounded-2xl max-w-[70%] break-words shadow-md
                ${msg.sender === phone ? "bg-pink-400 text-white" : "bg-pink-200 text-white"}`}>
                {msg.text && <p>{msg.text}</p>}
                {msg.image && (
                  <img src={msg.image} alt="sent" className="rounded-xl mt-2 max-h-40" />
                )}
              </div>
            </div>
          ))}


        </div>
        <div className="flex items-center gap-2 bg-white bg-opacity-60 p-2 rounded-xl">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 border rounded-xl"
            placeholder="say something"
          />
          <input type="file" onChange={handleImage} />
          <button
            onClick={sendMessage}
            className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
