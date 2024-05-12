const express = require("express");
const {
  sendMessage,
  fetchAllMessages,
} = require("../controller/messageController");
const { protect } = require("../middleware/protect");

const routes = express.Router();

routes.route("/").post(protect, sendMessage);
routes.route("/:chatId").get(protect, fetchAllMessages);

module.exports = routes;
