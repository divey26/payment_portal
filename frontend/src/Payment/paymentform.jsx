import {
  Layout,
  Card,
  Typography,
  Button,
  Space,
  Row,
  Col,
  Tag,
  Avatar,
  message,
} from "antd";
import {
  LeftOutlined,
  BellOutlined,
  SettingOutlined,
  CreditCardOutlined,
  BankOutlined,
  CalendarOutlined,
  FileTextOutlined,
  RightOutlined,
  DownloadOutlined,
  HomeOutlined,
  HistoryOutlined,
  WalletOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import PaymentModal from "../Components/PaymentModal";
import { useBalance } from "../context/BalanceContext";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

export default function PaymentsPage() {
  const [methods, setMethods] = useState([]);
  const [bills, setBills] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const { balance } = useBalance();
  const navigate = useNavigate();

  const openAdd = () => setAddOpen(true);
  const closeAdd = () => setAddOpen(false);

  // Fetch payment methods and bills
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/payments")
      .then((res) => setMethods(res.data))
      .catch(() => message.error("Failed to fetch payment methods"));

    axios
      .get("http://localhost:5000/api/bills")
      .then((res) => setBills(res.data))
      .catch(() => message.error("Failed to fetch billing history"));
  }, []);

  const handleAddPayment = async (methodData) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/payments",
        methodData
      );
      setMethods((prev) => [...prev, data]);
      message.success("Payment method added successfully");
    } catch {
      message.error("Failed to add payment method");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      {/* ---------- HEADER ---------- */}
      <Header
        style={{
          background: "#fff",
          padding: "0 16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Row align="middle" justify="space-between">
          <Space size={16} align="center">
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={() => navigate(-1)}
            />
            <Title level={4} style={{ margin: 0 }}>
              Payments
            </Title>
          </Space>
          <Space size={8}>
            <Button type="text" icon={<BellOutlined />} />
            <Button type="text" icon={<SettingOutlined />} />
          </Space>
        </Row>
      </Header>

      {/* ---------- CONTENT ---------- */}
      <Content style={{ padding: 16 }}>
        {/* BALANCE CARD */}
        <Card
          style={{
            background: "#16A34A",
            color: "#fff",
            border: "none",
            borderRadius: 16,
            marginBottom: 16,
          }}
          bodyStyle={{ padding: 20 }}
        >
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Text style={{ color: "rgba(255,255,255,0.85)" }}>
              Current Balance
            </Text>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>
              LKR {balance.toFixed(2)}
            </Title>

            <Row align="middle" justify="space-between" style={{ marginTop: 8 }}>
              <Space>
                <Avatar
                  size={28}
                  style={{ background: "rgba(255,255,255,0.2)" }}
                  icon={<CalendarOutlined />}
                />
                <div>
                  <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                    Next Payment
                  </Text>
                  <br />
                  <Text strong style={{ color: "#fff" }}>
                    {dayjs().add(1, "month").date(15).format("MMMM D, YYYY")}
                  </Text>
                </div>
              </Space>

              <Button
                type="primary"
                size="large"
                style={{
                  background: "#fff",
                  color: "#0f5132",
                  borderColor: "#fff",
                  borderRadius: 9999,
                  paddingInline: 20,
                }}
                onClick={() => navigate("/form")}
              >
                Pay Now
              </Button>
            </Row>
          </Space>
        </Card>

        {/* PAYMENT METHODS */}
        <Title level={5} style={{ margin: 0 }}>
          Payment Methods
        </Title>

        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          {methods.map((m) => (
            <Card
              key={m._id || m.id}
              hoverable
              style={{ borderRadius: 16 }}
              bodyStyle={{ padding: 14 }}
            >
              <Row align="middle" justify="space-between">
                <Space>
                  <Avatar
                    size={40}
                    icon={
                      m.kind === "bank" ? <BankOutlined /> : <CreditCardOutlined />
                    }
                    style={{
                      background: m.kind === "card" ? "#eef1ff" : "#f2fbff",
                      color: "#3b82f6",
                    }}
                  />
                  <div>
                    <Text strong>{m.title}</Text>
                    <br />
                    <Text type="secondary">{m.subtitle}</Text>
                  </div>
                </Space>

                <Space>
                  {m.isDefault && (
                    <Tag color="success" style={{ borderRadius: 999 }}>
                      Default
                    </Tag>
                  )}
                  <RightOutlined style={{ color: "#c0c4cc" }} />
                </Space>
              </Row>
            </Card>
          ))}
        </Space>

        <Row align="middle" justify="end" style={{ margin: "8px 0" }}>
          <Button type="link" style={{ paddingRight: 0 }} onClick={openAdd}>
            + Add
          </Button>
        </Row>

        {/* BILLING HISTORY */}
        <Title level={5} style={{ marginTop: 20 }}>
          Billing History
        </Title>
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          {bills.map((b) => (
            <Card
              key={b._id || b.id}
              hoverable
              bodyStyle={{ padding: 14 }}
              style={{
                borderRadius: 16,
                boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
              }}
            >
              <Row align="middle" justify="space-between">
                <Space size={12} align="center">
                  <Avatar
                    size={40}
                    icon={<FileTextOutlined />}
                    style={{ background: "#eafff1", color: "#16a34a" }}
                  />
                  <div style={{ lineHeight: 1.1 }}>
                    <Text strong style={{ display: "block" }}>
                      {b.month || dayjs(b.paidAt).format("MMMM YYYY")}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Paid on {dayjs(b.paidAt).format("MMMM D, YYYY")}
                    </Text>
                  </div>
                </Space>

                <Space size={12} align="center">
                  <Text strong style={{ whiteSpace: "nowrap" }}>
                    LKR {b.amount}
                  </Text>
                  <Button
                    type="text"
                    icon={<DownloadOutlined />}
                    onClick={() => message.info("Download started")}
                  />
                </Space>
              </Row>
            </Card>
          ))}
        </Space>
      </Content>

      {/* ---------- FOOTER ---------- */}
      <Footer
        style={{
          background: "#fff",
          borderTop: "1px solid #f0f0f0",
          padding: "8px 16px",
        }}
      >
        <Row justify="space-around" align="middle">
          <Tab icon={<HomeOutlined />} label="Home" />
          <Tab icon={<HistoryOutlined />} label="History" />
          <Tab icon={<WalletOutlined />} label="Payment" active />
          <Tab icon={<UserOutlined />} label="Profile" />
        </Row>
      </Footer>

      {/* ---------- ADD PAYMENT MODAL ---------- */}
      <PaymentModal open={addOpen} onCancel={closeAdd} onAdd={handleAddPayment} />
    </Layout>
  );
}

// Bottom Tab Component
function Tab({ icon, label, active }) {
  return (
    <Space direction="vertical" align="center" size={2}>
      <Avatar
        size={28}
        style={{
          background: active ? "#e6f4ff" : "#f5f5f5",
          color: active ? "#1677ff" : "#8c8c8c",
        }}
        icon={icon}
      />
      <Text style={{ fontSize: 12, color: active ? "#1677ff" : "#8c8c8c" }}>
        {label}
      </Text>
    </Space>
  );
}
