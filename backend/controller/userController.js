const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { createToken } = require("../config/token");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide all fields");
  }
  //checking if user already exists in the database
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  const user = await User.create({
    name,
    email,
    password,
    pic,
  });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: createToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create user");
  }
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new Error("please provide email and password"));
  }
  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: createToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  const keywords = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keywords)
    .select("-password")
    .find({ _id: { $ne: req.user._id } });

  res.status(200).json(users);
});

module.exports = { registerUser, login, getAllUsers };
