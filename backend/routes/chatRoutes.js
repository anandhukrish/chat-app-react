const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  addToGroup,
  removeFromGroup,
  renameGroupChat,
} = require("../controller/chatController");
const { protect } = require("../middleware/protect");

const routes = express.Router();

routes.route("/").post(protect, accessChat).get(protect, fetchChats);
routes.route("/group").post(protect, createGroupChat);
routes.route("/rename").put(protect, renameGroupChat);
routes.route("/groupadd").put(protect, addToGroup);
routes.route("/groupremove").put(protect, removeFromGroup);

module.exports = routes;
