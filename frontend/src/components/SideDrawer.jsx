import {
  Box,
  Button,
  Text,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Drawer,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  DrawerOverlay,
  DrawerContent,
  Input,
  useToast,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon, Search2Icon } from "@chakra-ui/icons";
import { useChat } from "../context/useContext";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { app } from "../api/axios";
import ChatLoading from "./ChatLoading";
import UserListItem from "./UserListItem";
import { getSender } from "../config/chatLogics";

const SideDrawer = () => {
  const {
    user,
    setSelectedChat,
    setChats,
    chats,
    notification,
    setNotification,
  } = useChat();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState();
  const [chatLoading, setChatLoading] = useState();
  const [searchResult, setSearchResult] = useState();
  console.log(notification);

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please enter a search term.",
        status: "warning",
        isClosable: true,
        duration: 3000,
        position: "bottom",
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
      const response = await app.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(response.data);
    } catch (error) {
      toast({
        title: "Error Occured",
        status: "error",
        isClosable: true,
        duration: 3000,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    if (!userId) {
      toast({
        title: "chat not found!",
        status: "warning",
        isClosable: true,
        duration: 3000,
        position: "bottom-left",
      });
      return;
    }
    try {
      setChatLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await app.post(`/api/chat`, { userId }, config);
      if (!chats.find((chat) => chat._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      setChatLoading(false);
      onClose();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error Occured",
        status: "error",
        isClosable: true,
        duration: 3000,
        position: "bottom-left",
      });
      setChatLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        w="100%"
        p="5px 10px"
        bg="white"
      >
        <Tooltip>
          <Button onClick={onOpen}>
            <Search2Icon />
            <Text display={{ base: "none", md: "flex" }} pl="10px">
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl">Talk To Tive</Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <BellIcon />
              <Badge backgroundColor="red" color="white">
                {notification.length}
              </Badge>
            </MenuButton>
            <MenuList>
              <MenuList>
                {!notification.length && "No notification found"}
                {notification.map((noti) => (
                  <MenuItem
                    key={noti._id}
                    onClick={() => {
                      setSelectedChat(noti.chat);
                      setNotification(notification.filter((n) => n !== noti));
                    }}
                  >
                    {noti.chat.isGroupChat
                      ? `New Message in ${noti.chat.chatName}`
                      : `New Message in ${getSender(user, noti.chat.users)}`}
                  </MenuItem>
                ))}
              </MenuList>
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                name={user.name}
                src={user.pic}
                cursor="pointer"
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuItem onClick={logout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer
        placement="left"
        onClose={onClose}
        onOpen={onOpen}
        isOpen={isOpen}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search User</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  user={user}
                  key={user._id}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {chatLoading && <Spinner />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
