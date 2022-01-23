const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get("/login", (req, res) => {
  res.json({message: "hello from server"});
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, '..client/build', 'index.html'));
})

app.listen(8888, () => {
  console.log(`Listening on 8888`);
});