const express = require("express");
const {
  registerUser,
  login,
  getAllUsers,
} = require("../controller/userController");
const { protect } = require("../middleware/protect");

const routes = express.Router();

routes.route("/register").post(registerUser);
routes.route("/login").post(login);
routes.route("/").get(protect, getAllUsers);

module.exports = routes;
