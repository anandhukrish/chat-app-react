import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { app } from "../api/axios";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [pic, setPic] = useState();
  const [loading, setLoading] = useState();

  const handleClick = () => {
    setShow((prev) => !prev);
  };

  const postImage = (pic) => {
    if (pic === undefined) {
      toast({
        title: "Please select an image.",
        isClosable: true,
        status: "warning",
        duration: 5000,
        position: "bottom",
      });
      return;
    }
    setLoading(true);
    if (pic.type === "image/jpeg" || pic.type === "image/png") {
      const data = new FormData();
      data.append("file", pic);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "ananthu-krish");
      fetch("https://api.cloudinary.com/v1_1/ananthu-krish/image/upload", {
        method: "POST",
        body: data,
      })
        .then((response) => response.json())
        .then((data) => {
          setPic(data.url.toString());
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
        });
    } else {
      toast({
        title: "Invalid file type.",
        description: "Only JPEG and PNG files are supported.",
        isClosable: true,
        status: "error",
        duration: 5000,
        position: "bottom",
      });
      return;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Field missing.",
        description: "Please fill all the fields.",
        isClosable: true,
        status: "error",
        duration: 5000,
        position: "top-right",
      });
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match.",
        description:
          "The password you entered does not match the one in the confirmation field.",
        isClosable: true,
        status: "error",
        duration: 5000,
        position: "top-right",
      });
      setLoading(false);
      return;
    }
    try {
      const { data } = await app.post("/api/user/register", {
        name,
        email,
        password,
        pic,
      });

      localStorage.setItem("user", JSON.stringify(data));
      setLoading(false);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      toast({
        title: "Registration successfull",
        isClosable: true,
        status: "success",
        duration: 5000,
        position: "top-right",
      });
    } catch (error) {
      toast({
        title: "Error Occured",
        description: error.message,
        isClosable: true,
        status: "error",
        duration: 5000,
        position: "top-right",
      });
      setLoading(false);
    }
  };
  return (
    <VStack>
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      <FormControl id="user-email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter Your Email"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="register-password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup size="md">
          <Input
            pr="4.5rem"
            type={show ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="confirm-password" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup size="md">
          <Input
            pr="4.5rem"
            type={show ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="pic">
        <FormLabel>Upload Your Pic</FormLabel>
        <Input
          p={1.5}
          accept="image/*"
          type="file"
          onChange={(e) => postImage(e.target.files[0])}
        />
      </FormControl>
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: "15px" }}
        onClick={handleSubmit}
        isLoading={loading}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default RegisterForm;
