const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    res.status(400);
    throw new Error("Invalid data passed to requset");
  }
  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };
  try {
    let message = await Message.create(newMessage);
    message = await message.populate("sender", "name  pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

const fetchAllMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "-password")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessage, fetchAllMessages };
