// pages/PaymentFailed.jsx
import React, { useEffect, useState } from "react";
import {
  ConfigProvider,
  Layout,
  Card,
  Result,
  Typography,
  Descriptions,
  Button,
  Space,
  Divider,
  Spin,
} from "antd";
import {
  CloseCircleFilled,
  HomeOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  UserOutlined,
  LeftOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const { Header, Content, Footer } = Layout;
const { Text, Title } = Typography;

const API = "http://localhost:5000";

export default function PaymentFailed() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setData(null);
      return;
    }
    axios
      .get(`${API}/api/bills/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  const fmtLKR = (n) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(Number(n || 0));
  const safeDateTime = (v) =>
    v ? new Date(v).toLocaleString() : new Date().toLocaleString();

  const HeaderBar = () => (
    <Header
      style={{
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
        padding: "0 16px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Space size="middle" align="center">
        <Button type="text" icon={<LeftOutlined />} onClick={() => navigate(-1)} />
        <Text strong style={{ fontSize: 16 }}>Payments</Text>
      </Space>
      <Space>
        <Button type="text" icon={<BellOutlined />} />
      </Space>
    </Header>
  );

  const NavItem = ({ icon, label, active }) => (
    <Space direction="vertical" size={0} style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ fontSize: 20, color: active ? "#ff4d4f" : "#8c8c8c", lineHeight: 1 }}>{icon}</div>
      <Text style={{ fontSize: 12, color: active ? "#ff4d4f" : "#8c8c8c" }}>{label}</Text>
    </Space>
  );

  const BottomNav = () => (
    <Footer
      style={{
        background: "#fff",
        borderTop: "1px solid #f0f0f0",
        padding: "8px 12px calc(8px + env(safe-area-inset-bottom))",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          textAlign: "center",
          gap: 4,
        }}
      >
        <NavItem icon={<HomeOutlined />} label="Home" />
        <NavItem icon={<ClockCircleOutlined />} label="History" />
        <NavItem icon={<CreditCardOutlined />} label="Payment" active />
        <NavItem icon={<UserOutlined />} label="Profile" />
      </div>
    </Footer>
  );

  if (loading) {
    return (
      <Layout style={{ minHeight: "100dvh", background: "#f7f9fb", maxWidth: 420, margin: "0 auto" }}>
        <Content style={{ padding: 32, textAlign: "center" }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout style={{ minHeight: "100dvh", background: "#f7f9fb", maxWidth: 420, margin: "0 auto" }}>
        <Content style={{ padding: 32, textAlign: "center" }}>
          <Result status="error" title="Payment Not Found" />
          <Button type="primary" onClick={() => navigate("/pay")}>Back to Payments</Button>
        </Content>
      </Layout>
    );
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#ff4d4f", borderRadius: 12, fontSize: 14 } }}>
      <Layout
        style={{
          minHeight: "100dvh",
          background: "#f7f9fb",
          maxWidth: 420,
          margin: "0 auto",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <HeaderBar />
        <Content style={{ padding: 16 }}>
          <Card style={{ borderRadius: 16, padding: 0, overflow: "hidden" }} bodyStyle={{ padding: 0 }}>
            <div style={{ padding: "20px 16px 0" }}>
              <Result
                status="error"
                icon={<CloseCircleFilled style={{ color: "#ff4d4f" }} />}
                title={
                  <div style={{ marginTop: -8 }}>
                    <Text type="secondary">Payment Failed</Text>
                    <div style={{ marginTop: 6 }}>
                      <Title level={3} style={{ margin: 0, fontWeight: 800, letterSpacing: 0.2 }}>
                        {fmtLKR(data.amount)}
                      </Title>
                    </div>
                  </div>
                }
                subTitle={<Text type="secondary">Reason: Insufficient balance</Text>}
                extra={null}
              />
            </div>

            <div style={{ padding: "0 16px 8px" }}>
              <Descriptions
                column={1}
                colon={false}
                labelStyle={{ color: "#8c8c8c" }}
                contentStyle={{ fontWeight: 600 }}
                items={[
                  { key: "ref", label: "Ref Number", children: data.reference || "-" },
                  { key: "time", label: "Attempt Time", children: safeDateTime(data.paidAt) },
                  { key: "method", label: "Payment Method", children: data?.paymentMethod?.title || "Card Payment" },
                  { key: "sender", label: "Sender Name", children: data?.senderName || "-" },
                  { key: "amount", label: "Amount", children: fmtLKR(data.amount) },
                ]}
              />
            </div>

            <Divider style={{ margin: "8px 0 0" }} />

            <div style={{ padding: "12px 16px 16px", display: "grid", gap: 12 }}>

              <Button type="primary" block style={{ height: 44 }} onClick={() => navigate(-1)}>
                Try Again
              </Button>
              <Button block style={{ height: 44 }} onClick={() => navigate("/")}>
                Go Home
              </Button>
            </div>
          </Card>
        </Content>
        <BottomNav />
      </Layout>
    </ConfigProvider>
  );
}
