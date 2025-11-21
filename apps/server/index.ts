import express from "express";
import cors from "cors";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import cron from "cron";

const app = express();
app.use(cors());
app.use(express.json());

const job = new cron.CronJob("*/5 * * * *", function () {
  console.log("Clearing messages");
  try {
    messages.length = 0;
  } catch (error) {
    console.error("Error clearing messages:", error);
  }
});
job.start();

interface Position {
  x: number;
  y: number;
  id: string;
  color: string;
  type: "move";
}

interface Message {
  text: string;
  id: string;
  color: string;
  type: "chat";
}

const positions: Position[] = [];
const messages: Message[] = [];

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const PORT = process.env.PORT || 3000;

const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
  positions.length = 0; // Clear positions on new connection
  console.log("New WebSocket connection established");

  ws.on("message", (data: Position | Message) => {
    console.log(`Received message: ${JSON.parse(data.toString())}`);
    console.log(`Type: ${JSON.parse(data.toString()).type}`);
    const dataJSON = JSON.parse(data.toString());
    // ws.send(`Echo: ${position}`);
    if (dataJSON.type === "move") {
      console.log("here");

      positions.findIndex((p) => p.id === dataJSON.id) !== -1
        ? (positions[positions.findIndex((p) => p.id === dataJSON.id)] =
            dataJSON)
        : positions.push(dataJSON);
    }
    if (dataJSON.type === "chat") {
      messages.push(dataJSON);
    }

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        if (dataJSON.type === "chat") {
          console.log("messages:", messages);

          client.send(JSON.stringify(messages));
          return;
        }
        console.log("position:", positions);

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
