// index.js - WebSocket Proxy Server for Binance
import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import cors from "cors";

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", function connection(clientSocket) {
  clientSocket.on("message", function message(raw) {
    const { symbol, interval } = JSON.parse(raw.toString());
    const binanceURL = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`;

    const binanceSocket = new WebSocket(binanceURL);

    binanceSocket.onmessage = (event) => {
      clientSocket.send(event.data);
    };

    binanceSocket.onclose = () => {
      clientSocket.close();
    };

    clientSocket.on("close", () => {
      binanceSocket.close();
    });
  });
});

app.get("/", (req, res) => {
  res.send("Binance WebSocket Proxy çalışıyor ✅");
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log("Proxy sunucu çalışıyor:", PORT);
});
