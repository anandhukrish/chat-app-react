import { useContext } from "react";
import { ChatContext } from "./ContextProvider";

export const useChat = () => {
  const useChat = useContext(ChatContext);

  if (!useChat) {
    throw new Error("Please wrap your app in the ChatProvider");
  }

  return useChat;
};
