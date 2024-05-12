import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState();
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setUser(user);
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
