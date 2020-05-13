const express = require("express");
const userRouter = require("./users/userRouter");
const postRouter = require("./posts/postRouter");
const stringifyDate = require("./utils/stringifyDate");

const server = express();

server.use(express.json());
server.use(logger);

server.use("/users", userRouter);
server.use("/posts", postRouter);

server.get("/", (req, res) => {
  res.send(`<h2>Let's write some middleware!</h2>`);
});

server.use(errorHandling);



//middleware

function logger(req, res, next) {
  console.log(
    "\x1b[32m%s\x1b[34m%s\x1b[37m%s\x1b[0m",
    req.method + " ",
    req.path + " ",
    stringifyDate("Y-m-d H:i:s")
  );
  next();
}

function errorHandling(error, req, res, next) {
  console.error(error);
  const { status, message } = error;
  res.status(status).json({ message });
}

module.exports = server;
