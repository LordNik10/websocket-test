import { useEffect, useRef, useState } from "react";
import "./App.css";
import { ServerReady } from "./ServerReady";

const randomId = () => Math.random().toString(36).substring(2, 9);

const colors = ["blue", "green", "orange", "purple", "pink", "yellow"];
const myColor = colors[Math.floor(Math.random() * colors.length)];

interface Position {
  x: number;
  y: number;
  id: string;
  color: string;
}

interface ChatMessage {
  text: string;
  id: string;
  color: string;
}

function App() {
  const [wsConnected, setWsConnected] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const id = randomId();
  const [users, setUsers] = useState<Position[]>([]);

  const [myUser, setMyUser] = useState<{
    x: number;
    y: number;
    color: string;
  }>({
    x: 0,
    y: 0,
    color: myColor,
  });

  const wsUrl = `ws://localhost:3000`;

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const container = document.querySelector(
        "div[style*='position: relative']"
      );
      if (container) {
        const containerRect = container.getBoundingClientRect();
        // Circle dimensions
        const circleWidth = 50;
        const circleHeight = 50;
        // Adjust boundaries to account for the circle size
        const leftBoundary = containerRect.left;
        const rightBoundary = containerRect.right - circleWidth;
        const topBoundary = containerRect.top;
        const bottomBoundary = containerRect.bottom - circleHeight;
        if (
          e.clientX < leftBoundary ||
          e.clientX > rightBoundary ||
          e.clientY < topBoundary ||
          e.clientY > bottomBoundary
        ) {
          return;
        }
      }

      setMyUser({ x, y, color: myColor });
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ x, y, id, color: myColor, type: "move" })
        );
      }
    };
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log({ data });
      console.log("type:", data[0].type);

      if (Array.isArray(data) && data[0].type === "move") {
        setUsers(data.filter((u) => u.id !== id));
      } else if (data[0].type === "chat") {
        console.log("chat", data);

        setChatMessages(data);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setWsConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setWsConnected(false);
    };
    return () => {
      ws.close();
    };
  }, []);
  const handleSendMessage = () => {
    if (!message.trim()) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: "chat", id, color: myColor, text: message })
      );
      setChatMessages((prev) => [
        ...prev,
        { id, color: myColor, text: message },
      ]);
      setMessage("");
    }
  };

  return (
    <ServerReady>
      <div>
        {wsConnected ? "You are connected ✅" : "You are disconnected ❌"}
        {/* <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send Message</button>
      <div>Received Message: {receivedMessage}</div> */}
        <div
          style={{
            width: "500px",
            height: "500px",
            border: "1px solid black",
            position: "relative",
          }}
        >
          <div
            style={{
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              backgroundColor: myUser.color,
              position: "absolute",
              left: myUser.x,
              top: myUser.y,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "24px",
            }}
          ></div>
          {users.map((user) => {
            const u = user;
            return (
              <div
                key={u.id}
                style={{
                  borderRadius: "50%",
                  width: "50px",
                  height: "50px",
                  backgroundColor: u.color,
                  position: "absolute",
                  left: u.x,
                  top: u.y,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "24px",
                }}
              ></div>
            );
          })}
        </div>
        {/* Live Chat UI */}
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 300,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            zIndex: 1000,
            padding: 12,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              maxHeight: 180,
              marginBottom: 8,
            }}
          >
            {chatMessages.map((msg, idx) => {
              console.log({ msg });

              return (
                <div
                  key={idx}
                  style={{
                    marginBottom: 4,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: msg.color,
                      marginRight: 8,
                    }}
                  ></span>
                  <span style={{ wordBreak: "break-word" }}>{msg.text}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex" }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                flex: 1,
                marginRight: 8,
                padding: 4,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                padding: "4px 12px",
                borderRadius: 4,
                border: "none",
                background: "#007bff",
                color: "#fff",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </ServerReady>
  );
}

export default App;
