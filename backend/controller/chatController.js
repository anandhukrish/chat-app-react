const Chat = require("../models/chatModel");
const handleAsync = require("express-async-handler");
const User = require("../models/userModel");

const accessChat = handleAsync(async (req, res, next) => {
  const { userId } = req.body;

  let isChatExist = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate({
      path: "latestMessage",
      select: "sender content chat",
      options: { strictPopulate: false },
    });

  isChatExist = await User.populate(isChatExist, {
    path: "latestMessage.sender",
    select: "name email pic",
    options: { strictPopulate: false },
  });
  console.log(isChatExist);
  if (isChatExist.length > 0) {
    res.send(isChatExist[0]);
  } else {
    const newChat = {
      isGroupChat: false,
      chatName: req.user.name,
      users: [req.user._id, userId],
    };
    try {
      const createdChat = await Chat.create(newChat);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(fullChat);
    } catch (err) {
      res.status(400);
      throw new Error(err.message);
    }
  }
});

const fetchChats = handleAsync(async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate({
        path: "latestMessage",
        select: "sender content chat",
        options: { strictPopulate: false },
      })
      .sort({ updatedAt: -1 });
    const chatResponse = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name email pic",
      options: { strictPopulate: false },
    });
    res.status(200).send(chatResponse);
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

const createGroupChat = handleAsync(async (req, res) => {
  if (!req.body.chatName || !req.body.users) {
    res.status(400).json({ msg: "Missing fields!" });
  }
  const { chatName } = req.body;
  const users = JSON.parse(req.body.users);
  users.push(req.user);
  try {
    const createdChat = await Chat.create({
      chatName: chatName,
      users: users,
      groupAdmin: req.user._id,
      isGroupChat: true,
    });

    const gropedChat = await Chat.findOne({ _id: createdChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).send(gropedChat);
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

const renameGroupChat = handleAsync(async (req, res, next) => {
  const { name, chatId } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: name,
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) {
    res.status(404);
    throw new Error("chat not found");
  } else {
    res.json(updatedChat);
  }
});

const addToGroup = handleAsync(async (req, res, next) => {
  const { chatId, userId } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) {
    res.status(404);
    throw new Error("chat not found");
  } else {
    res.json(updatedChat);
  }
});

const removeFromGroup = handleAsync(async (req, res, next) => {
  const { chatId, userId } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) {
    res.status(404);
    throw new Error("chat not found");
  } else {
    res.json(updatedChat);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroupChat,
};
