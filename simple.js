const express = require("express");

const app = express();

app.get("/events", function (_, res) {
  console.log("Got /events");
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  // Tell the client to retry every 10 seconds if connectivity is lost
  res.write("retry: 10000\n\n");
  let count = 0;

  setInterval(() => {
    console.log("Emit", ++count);
    res.write(`id: ${count}\nevent: blubb\ndata: ${count}\n\n`);
  }, 1000);
});

app.use(express.static("public-simple"));

app.listen(3000, () => {
  console.log(`Facts Events service listening at http://localhost:${3000}`);
});
