import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useChat } from "../context/useContext";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/chatLogics";
import ProfileModal from "./ProfileModal";
import GroupChatModal from "./GroupChatModal";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import { useEffect, useState } from "react";
import { app } from "../api/axios";
import "./styles.css";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";
let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    useChat();
  const toast = useToast();

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await app.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      socket.emit("join room", selectedChat._id);
      setMessages(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error occured",
        status: "error",
        duration: "3000",
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await app.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (err) {
        console.log(err);
        toast({
          title: "Error sending message!",
          description: "Please check your internet connection.",
          status: "error",
          position: "top-right",
        });
      }
    }
  };

  useEffect(() => {
    socket.on("received message", (newRecievedMessage) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newRecievedMessage.chat._id
      ) {
        if (!notification.includes(newRecievedMessage)) {
          setNotification([newRecievedMessage, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newRecievedMessage]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    const timer = 3000;
    setTimeout(() => {
      let currentTime = new Date().getTime();
      let timeDiff = currentTime - lastTypingTime;
      if (timeDiff >= timer && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timer);
  };
  return (
    <>
      {selectedChat ? (
        <>
          <Text
            display="flex"
            pb={3}
            px={2}
            alignItems="center"
            width="100%"
            justifyContent={{ base: "space-between" }}
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            backgroundColor="#E8E8E8"
            w="100%"
            h="100%"
            overflowY="hidden"
            borderRadius="lg"
          >
            {loading ? (
              <Spinner
                size="xl"
                h={20}
                w={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl onKeyDown={sendMessage} isRequired>
              {isTyping ? <p>Loading...</p> : <></>}
              <Input
                placeholder="Enter the Message ... "
                variant="filled"
                bg="#E0E0E0"
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3}>
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
