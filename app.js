const app = require("express")();
const port = 8080;

app.get("/", (req, res) => {
  res.send("Hello from Docker!");
});

app.listen(port, () => {
  console.log("Running on port " + port);
});
