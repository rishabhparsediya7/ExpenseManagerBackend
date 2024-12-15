// server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoute");
const authRoute = require("./routes/emailRoute");
const activityRoute = require("./routes/activityCentreRoute");
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.use("/api", userRoutes);
app.use("/api", expenseRoutes);
app.use("/auth", authRoute);
app.use("/suggestions", activityRoute);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
