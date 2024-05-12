import { ViewIcon } from "@chakra-ui/icons";
import {
  Button,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          display={{ base: "flex" }}
          icon={<ViewIcon />}
          onClick={onOpen}
        />
      )}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="40px" display="flex" justifyContent="center">
            {user?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Image
              src={user?.pic}
              alt={user?.name}
              boxSize="150px"
              borderRadius="full"
            />
            <Text fontSize={{ base: "28px", md: "30px" }}>{user?.email}</Text>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
