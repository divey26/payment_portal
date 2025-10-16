// src/pages/PaymentsPage.jsx
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

// PDF libs
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  // Fetch payment methods and last 3 bills
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/payments")
      .then((res) => setMethods(res.data || []))
      .catch(() => message.error("Failed to fetch payment methods"));

    axios
      .get("http://localhost:5000/api/bills")
      .then((res) => {
        const lastThree = [...(res.data || [])]
          .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
          .slice(0, 3);
        setBills(lastThree);
      })
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

  // ---------- PDF helpers ----------
  const fmtLKR = (n) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(Number(n || 0));

  const safeDateTime = (v) =>
    v ? new Date(v).toLocaleString() : new Date().toLocaleString();

  const handleDownload = (bill) => {
    if (!bill) return;

    const doc = new jsPDF({ unit: "pt", format: "a5", orientation: "portrait" });
    const pageW = doc.internal.pageSize.getWidth();
    const marginX = 24;

    // Header band
    doc.setFillColor(0, 200, 83);
    doc.roundedRect(0, 0, pageW, 64, 0, 0, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Payment Receipt", marginX, 38);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Reference: ${bill.reference || "-"}`, marginX, 54);

    // PAID badge
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    const paidW = doc.getTextWidth("PAID") + 14;
    doc.roundedRect(pageW - paidW - marginX, 22, paidW, 20, 6, 6, "S");
    doc.text("PAID", pageW - paidW - marginX + 7, 37);

    // Body
    let y = 84;
    doc.setTextColor(0, 0, 0);

    // Amount big
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(fmtLKR(bill.amount), marginX, y);

    // Success text
    doc.setFontSize(11);
    doc.setTextColor(0, 200, 83);
    doc.text("Payment Success", marginX, (y += 18));
    doc.setTextColor(0, 0, 0);

    const details = [
      ["Ref Number", bill.reference || "-"],
      ["Payment Time", safeDateTime(bill.paidAt)],
      ["Payment Method", bill?.paymentMethod?.title || "Card Payment"],
      ["Sender Name", bill?.senderName || "-"],
      ["Amount", fmtLKR(bill.amount)],
    ];

    autoTable(doc, {
      startY: y + 12,
      head: [["Field", "Value"]],
      body: details,
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [247, 249, 251], textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [252, 252, 252] },
      columnStyles: {
        0: { cellWidth: 130, textColor: [140, 140, 140] },
        1: { cellWidth: pageW - marginX * 2 - 130 },
      },
      margin: { left: marginX, right: marginX },
      theme: "grid",
    });

    const footerY = (doc.lastAutoTable?.finalY || 200) + 18;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "Thank you for your payment. This is a system-generated receipt.",
      marginX,
      footerY
    );

    doc.save(`receipt_${bill.reference || "payment"}.pdf`);
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
              LKR {Number(balance || 0).toFixed(2)}
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
        <Row align="middle" justify="space-between" style={{ margin: "8px 0" }}>
          <Title level={5} style={{ margin: 0 }}>
            Payment Methods
          </Title>
          <Button type="link" style={{ paddingRight: 0 }} onClick={openAdd}>
            + Add
          </Button>
        </Row>

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

        {/* BILLING HISTORY (last 3 only) */}
        <Title level={5} style={{ marginTop: 20 }}>
          Billing History
        </Title>
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          {bills.length === 0 && (
            <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 14 }}>
              <Text type="secondary">No bills to display yet.</Text>
            </Card>
          )}

          {bills.map((b) => {
            const isFailed = ["failed", "unsuccess", "unsuccessful", "unsecces"].includes(
              String(b.status || "").toLowerCase()
            );

            return (
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
                      style={{
                        background: isFailed ? "#ffecec" : "#eafff1",
                        color: isFailed ? "#ff4d4f" : "#16a34a",
                      }}
                    />
                    <div style={{ lineHeight: 1.1 }}>
                      <Text strong style={{ display: "block" }}>
                        {b.month || dayjs(b.paidAt).format("MMMM YYYY")}
                      </Text>
                      <Text
                        type={isFailed ? "danger" : "secondary"}
                        style={{ fontSize: 12 }}
                      >
                        {(isFailed ? "Attempted on " : "Paid on ") +
                          dayjs(b.paidAt).format("MMMM D, YYYY")}
                      </Text>
                    </div>
                  </Space>

                  <Space size={12} align="center">
                    <Text
                      strong
                      style={{
                        whiteSpace: "nowrap",
                        color: isFailed ? "#ff4d4f" : undefined,
                      }}
                    >
                      LKR {b.amount}
                    </Text>
                    <Button
                      type="text"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(b)}
                      title="Download receipt"
                    />
                  </Space>
                </Row>
              </Card>
            );
          })}
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
