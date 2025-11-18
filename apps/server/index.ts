import express from "express";
import cors from "cors";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";

const app = express();
app.use(cors());
app.use(express.json());

const positions: { x: number; y: number; id: string }[] = [];

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const PORT = process.env.PORT || 3000;

const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
  positions.length = 0; // Clear positions on new connection
  console.log("New WebSocket connection established");

  ws.on("message", (position: string) => {
    console.log(`Received message: ${position}`);
    // ws.send(`Echo: ${position}`);
    positions.findIndex((p) => p.id === JSON.parse(position.toString()).id) !==
    -1
      ? (positions[
          positions.findIndex(
            (p) => p.id === JSON.parse(position.toString()).id
          )
        ] = JSON.parse(position.toString()))
      : positions.push(JSON.parse(position.toString()));

    console.log("positions:", positions);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(positions));
      }
    });
  });
});

wss.on("close", () => {
  console.log("WebSocket connection closed");
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
