const express = require("express");
const { json, urlencoded } = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));

app.get("/status", (_, response) => response.json({ clients: clients.length }));

const PORT = 3000;

let clients = [];
let tasks = [];

app.get("/events", (request, response) => {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  response.writeHead(200, headers);
  response.write("retry: 10000\n\n");

  response.write(`event: blubb\ndata: ${JSON.stringify(tasks)}\n\n`);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    response,
  };

  clients.push(newClient);

  request.on("close", () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter((client) => client.id !== clientId);
  });
});

function sendEventsToAll() {
  clients.forEach((client) => {
    client.response.write(`event: blubb\ndata: ${JSON.stringify(tasks)}\n\n`);
  });
}

app.get("/task/:task", (request, response) => {
  const task = request.params.task;
  tasks.push(task);
  sendEventsToAll();
  response.sendStatus(200);
});

app.use(express.static("public"));
app.listen(PORT, () => {
  console.log(`Facts Events service listening at http://localhost:${PORT}`);
});
