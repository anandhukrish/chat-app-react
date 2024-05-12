import { Box } from "@chakra-ui/react";
import { app } from "../api/axios";
import SideDrawer from "../components/SideDrawer";
import { useChat } from "../context/useContext";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import { useState } from "react";

const ChatPage = () => {
  const { user } = useChat();
  const [fetchAgain, setFetchAgain] = useState(false);
  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="91.4vh"
        p="10px"
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default ChatPage;
