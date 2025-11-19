import { useEffect, useRef, useState } from "react";
import "./App.css";

const randomId = () => Math.random().toString(36).substring(2, 9);

const colors = ["blue", "green", "orange", "purple", "pink", "yellow"];
const myColor = colors[Math.floor(Math.random() * colors.length)];

function App() {
  const [wsConnected, setWsConnected] = useState(false);
  // const [message, setMessage] = useState<string>("");
  // const [receivedMessage, setReceivedMessage] = useState<string>("");
  const id = randomId();
  const [users, setUsers] = useState<
    { x: number; y: number; id: string; color: string; name: string }[]
  >([]);

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
    document.addEventListener("click", (e) => {
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
        wsRef.current.send(JSON.stringify({ x, y, id, color: myColor }));
      }
    });
  }, []);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);

    // Connect to WebSocket
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (Array.isArray(data)) {
        setUsers(data.filter((u) => u.id !== id));
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

  // const handleSendMessage = () => {
  //   if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
  //     alert("WebSocket is not connected");
  //     return;
  //   }

  //   if (!message.trim()) {
  //     alert("Please enter a message");
  //     return;
  //   }

  //   wsRef.current.send(message);
  //   setMessage("");
  // };

  return (
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
          console.log({ user });

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
    </div>
  );
}

export default App;
