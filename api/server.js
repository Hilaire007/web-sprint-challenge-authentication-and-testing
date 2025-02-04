const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const restrict = require("./middleware/restricted.js");

const authRouter = require("./auth/auth-router.js");
const jokesRouter = require("./jokes/jokes-router.js");

// const jokesData = require("./jokes/jokes-data.js");

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());

server.use("/api/auth", authRouter);
server.use("/api/jokes", restrict, jokesRouter); // only logged-in users should have access!

server.get("/api/jokes", restrict, (req, res) => {
  const jokes = [
    {
      id: "0189hNRf2g",
      joke: "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later.",
    },
    {
      id: "08EQZ8EQukb",
      joke: "Did you hear about the guy whose whole left side was cut off? He's all right now.",
    },
    {
      id: "08xHQCdx5Ed",
      joke: "Why didn't the skeleton cross the road? Because he had no guts.",
    },
  ];
  res.status(200).json(jokes);
});

module.exports = server;
