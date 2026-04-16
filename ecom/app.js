require("dotenv").config();

const express = require("express");

const { loadExpress } = require("./loaders/express");

const app = express();
loadExpress(app);

module.exports = { app };

