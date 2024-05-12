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

const SigninForm = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState();
  const handleClick = () => {
    setShow((prev) => !prev);
  };
  const handleSubmit = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Field missing.",
        description: "Please fill all the fields.",
        isClosable: true,
        status: "error",
        duration: 5000,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    const { data } = await app.post("/api/user/login", {
      email,
      password,
    });
    toast({
      title: "Login Successfully",
      isClosable: true,
      status: "success",
      duration: 5000,
      position: "bottom",
    });

    localStorage.setItem("userInfo", JSON.stringify(data));
    setEmail();
    setPassword();
    setLoading(false);
    navigate("/chats", { replace: true });
  };

  return (
    <VStack>
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter Your Email"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="password" isRequired>
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

      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: "15px" }}
        onClick={handleSubmit}
      >
        Login
      </Button>
      <Button
        colorScheme="red"
        variant="solid"
        width="100%"
        onClick={() => {
          setEmail("guest@gmail.com"), setPassword("password");
        }}
      >
        Guest User Credentials
      </Button>
    </VStack>
  );
};

export default SigninForm;
