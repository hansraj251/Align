require("dotenv").config();
require("./db");

const initializeDatabase = require("./database/init");
console.log("initializeDatabase =", initializeDatabase);
console.log("type =", typeof initializeDatabase);
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/", (req, res) => {

  res.json({

    success: true,

    message: "Welcome to Align API",

    version: "1.0.0"

  });

});

initializeDatabase();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`🚀 Align Server running on http://localhost:${PORT}`);

});