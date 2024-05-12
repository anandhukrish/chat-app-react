import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useChat } from "../context/useContext";
import { useState } from "react";
import { app } from "../api/axios";
import UserListItem from "./UserListItem";
import UserBadge from "./UserBadge";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { chats, user, setChats, selectedChat, setSelectedChat } = useChat();
  const toast = useToast();
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [renameLoading, setRenameLoading] = useState();
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await app.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResults(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        position: "bottom-left",
      });
      setLoading(false);
      return;
    }
  };

  const handleRename = async () => {
    if (selectedChat?.groupAdmin._id !== user._id) {
      toast({
        title: "Warning",
        description: "You are not authorized to update this chat.",
        status: "warning",
      });
      return;
    }
    if (!groupChatName) {
      toast({
        title: "Error",
        description: "Please enter a valid group name.",
        status: "error",
        isClosable: true,
      });
      return;
    }
    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await app.put(
        "/api/chat/rename",
        { name: groupChatName, chatId: selectedChat._id },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (error) {
      toast({
        title: "Unauthorized",
        description: "Please login first.",
        status: "error",
      });
    }
  };

  const handleAddUser = async (newUser) => {
    if (selectedChat.users.some((u) => u._id === newUser._id)) {
      toast({
        title: "already exist group.",
        status: "warning",
        position: "bottom-right",
        duration: 3000,
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await app.put(
        "/api/chat/groupadd",
        { chatId: selectedChat._id, userId: newUser._id },
        config
      );
      setLoading(false);
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        position: "bottom-left",
      });
      setLoading(false);
      return;
    }
  };

  const handleRemove = async (u) => {
    if (user._id !== selectedChat.groupAdmin._id && u._id !== user._id) {
      toast({
        title: "Only the admin can remove member",
        status: "info",
        position: "top",
        isClosable: "true",
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await app.put(
        `/api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: u._id,
        },
        config
      );
      user._id === u._id ? setSelectedChat() : setSelectedChat(data);
      fetchMessages();
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        position: "bottom-left",
      });
      setLoading(false);
      return;
    }
  };
  return (
    <>
      <IconButton icon={<ViewIcon />} onClick={onOpen} />
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="30px" display="flex" justifyContent="center">
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" alignItems="center" flexDirection="column">
            <Box w="100%" display="flex" flexWrap="wrap">
              {selectedChat?.users.map((user) => (
                <UserBadge
                  key={user._id}
                  user={user}
                  handleFunction={() => handleRemove(user)}
                />
              ))}
            </Box>
            <FormControl display="flex">
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                colorScheme="teal"
                size="md"
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users like Jhon , Alex"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            {loading ? (
              <Spinner />
            ) : (
              searchResults?.map((user) => (
                <UserListItem
                  user={user}
                  key={user._id}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" onClick={() => handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
