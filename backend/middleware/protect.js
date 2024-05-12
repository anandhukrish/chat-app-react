const User = require("../models/userModel");
const JWT = require("jsonwebtoken");
const handleAsync = require("express-async-handler");

const protect = handleAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const verifyUser = JWT.verify(token, process.env.SECRET_KEY);
      const user = await User.findById(verifyUser.id).select("-password");
      req.user = user;
      next();
    } catch (err) {
      res.status(401);
      throw new Error("Not authorized , token failed");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not authorized , no token ");
  }
});

module.exports = { protect };
