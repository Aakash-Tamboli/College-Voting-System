const express = require("express");
const bodyParser = require("body-parser");
const { configureDB } = require("./Config/configDB");
const user = require("./Routes/user");
const candidate = require("./Routes/candidate");
const dotEnv = require("dotenv");

// configuring other things
dotEnv.config();

const app = express();

// middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/user", user);
app.use("/candidate", candidate);

// making connection and put server into listening mode
configureDB(app);
