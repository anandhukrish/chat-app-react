import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import SigninForm from "../components/SigninForm";
import RegisterForm from "../components/RegisterForm";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const LoginPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) {
      navigate("/chats", { replace: true });
    }
  }, [navigate]);
  return (
    <Container maxW="xl" centerContent>
      <Box
        display="flex"
        justifyContent="center"
        p={3}
        bg={"white"}
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Tabs variant="soft-rounded" w="100%">
          <TabList>
            <Tab width="50%">Log In</Tab>
            <Tab width="50%">Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <SigninForm />
            </TabPanel>
            <TabPanel>
              <RegisterForm />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default LoginPage;
