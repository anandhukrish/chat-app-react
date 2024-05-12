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

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { chats, user, setChats } = useChat();
  const toast = useToast();
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState();

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

  const handleGroup = (user) => {
    if (selectedUsers.includes(user)) {
      toast({
        title: "already exist group.",
        status: "warning",
        position: "bottom-right",
        duration: 3000,
      });
      return;
    }

    setSelectedUsers((addedUsers) => [...addedUsers, user]);
  };

  const handleDelete = (user) => {
    setSelectedUsers((selUsr) => selUsr.filter((u) => u._id !== user._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Error",
        description: "Please fill out all fields.",
        status: "error",
        position: "top-right",
        isClosable: true,
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
      const { data } = await app.post(
        `/api/chat/group`,
        {
          chatName: groupChatName,
          users: JSON.stringify(selectedUsers),
        },
        config
      );
      setLoading(false);
      setChats([data, ...chats]);
      onClose();
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
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="40px"
            display="flex"
            justifyContent="center"
          ></ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" alignItems="center" flexDirection="column">
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users like Jhon , Alex"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box w="100%" display="flex" flexWrap="wrap">
              {selectedUsers.map((user) => (
                <UserBadge
                  key={user._id}
                  user={user}
                  handleFunction={() => handleDelete(user)}
                />
              ))}
            </Box>
            {loading ? (
              <Spinner />
            ) : (
              searchResults?.map((user) => (
                <UserListItem
                  user={user}
                  key={user._id}
                  handleFunction={() => handleGroup(user)}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme={"blue"} onClick={handleSubmit}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
