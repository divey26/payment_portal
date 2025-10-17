// src/pages/Login.jsx
import React, { useState } from "react";
import {
  ConfigProvider,
  Layout,
  Card,
  Typography,
  Form,
  Input,
  Button,
  Space,
  Divider,
  message,
} from "antd";
import {
  SyncOutlined, // for the recycle-like icon
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Content, Footer } = Layout;
const { Title, Text, Link } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      // TODO: replace with your auth call (e.g., axios.post('/api/login', values))
      await new Promise((r) => setTimeout(r, 900));
      message.success("Logged in successfully");
      navigate("/dash");
    } catch (e) {
      message.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#18b874", // Eco green
          borderRadius: 12,
        },
        components: {
          Button: {
            controlHeight: 48,
            fontWeight: 600,
          },
          Input: {
            controlHeight: 44,
          },
          Card: {
            boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
          },
        },
      }}
    >
      <Layout style={{ minHeight: "100vh", background: "#fff" }}>
        <Content
          style={{
            display: "grid",
            placeItems: "center",
            padding: "40px 16px",
          }}
        >
          <Card
            style={{ width: 380, borderRadius: 16 }}
            bodyStyle={{ padding: 28 }}
          >
            <Space
              direction="vertical"
              size={20}
              style={{ width: "100%", textAlign: "center" }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  background: "rgba(24,184,116,0.15)",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto",
                }}
              >
                <SyncOutlined spin style={{ fontSize: 28, color: "#18b874" }} />
              </div>

              <div>
                <Title level={3} style={{ marginBottom: 4 }}>
                  Welcome Back
                </Title>
                <Text type="secondary">
                  Log in to your EcoCollect account
                </Text>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
              >
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Enter a valid email" },
                  ]}
                >
                  <Input
                    placeholder="your.email@example.com"
                    autoComplete="email"
                  />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: "Please enter your password" },
                    { min: 8, message: "Password must be at least 8 characters" },
                  ]}
                >
                  <Input.Password
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </Form.Item>

                <div style={{ textAlign: "right", marginTop: -8, marginBottom: 12 }}>
                  <Link href="#" style={{ fontSize: 12 }}>
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                  
                >
                  Log In
                </Button>
              </Form>

              <Divider style={{ margin: "16px 0 8px" }} />
              <Text type="secondary">
                Don’t have an account?{" "}
                <Link href="#" style={{ color: "#18b874" }}>
                  Sign Up
                </Link>
              </Text>
            </Space>
          </Card>
        </Content>

        <Footer style={{ textAlign: "center", background: "#fff", color: "#98a2b3" }}>
          Version 1.0.0 • EcoCollect Inc.
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}
