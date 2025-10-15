// PaymentSuccess.jsx
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
  CheckCircleFilled,
  HomeOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  UserOutlined,
  LeftOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// ✅ Use the function form to avoid instance/patch issues
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const { Header, Content, Footer } = Layout;
const { Text, Title } = Typography;

export default function PaymentSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/bills/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  const fmtLKR = (n) =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(
      Number(n || 0)
    );
  const safeDateTime = (v) =>
    v ? new Date(v).toLocaleString() : new Date().toLocaleString();

  const handleDownload = () => {
    if (!data) return;

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
    doc.text(`Reference: ${data.reference || "-"}`, marginX, 54);

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
    doc.text(fmtLKR(data.amount), marginX, y);

    // Success text
    doc.setFontSize(11);
    doc.setTextColor(0, 200, 83);
    doc.text("Payment Success", marginX, (y += 18));
    doc.setTextColor(0, 0, 0);

    const details = [
      ["Ref Number", data.reference || "-"],
      ["Payment Time", safeDateTime(data.paidAt)],
      ["Payment Method", data?.paymentMethod?.title || "Card Payment"],
      ["Sender Name", data?.senderName || "-"],
      ["Amount", fmtLKR(data.amount)],
    ];

    // ✅ Call the plugin function instead of doc.autoTable(...)
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

    doc.save(`receipt_${data.reference || "payment"}.pdf`);
  };

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
      <div style={{ fontSize: 20, color: active ? "#00C853" : "#8c8c8c", lineHeight: 1 }}>{icon}</div>
      <Text style={{ fontSize: 12, color: active ? "#00C853" : "#8c8c8c" }}>{label}</Text>
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
        </Content>
      </Layout>
    );
  }

  return (
    <ConfigProvider
      theme={{ token: { colorPrimary: "#00C853", borderRadius: 12, fontSize: 14 } }}
    >
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
                status="success"
                icon={<CheckCircleFilled style={{ color: "#00C853" }} />}
                title={
                  <div style={{ marginTop: -8 }}>
                    <Text type="secondary">Payment Success!</Text>
                    <div style={{ marginTop: 6 }}>
                      <Title level={3} style={{ margin: 0, fontWeight: 800, letterSpacing: 0.2 }}>
                        LKR {data.amount}
                      </Title>
                    </div>
                  </div>
                }
                subTitle={null}
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
                  { key: "time", label: "Payment Time", children: safeDateTime(data.paidAt) },
                  { key: "method", label: "Payment Method", children: data?.paymentMethod?.title || "Card Payment" },
                  { key: "sender", label: "Sender Name", children: data?.senderName || "-" },
                  { key: "amount", label: "Amount", children: `LKR ${data.amount}` },
                ]}
              />
            </div>

            <Divider style={{ margin: "8px 0 0" }} />

            <div style={{ padding: "12px 16px 16px", display: "grid", gap: 12 }}>
              <Button block onClick={handleDownload} style={{ height: 44 }}>
                Download Receipt (PDF)
              </Button>
              <Button type="primary" block style={{ height: 44 }} onClick={() => navigate("/")}>
                Done
              </Button>
            </div>
          </Card>
        </Content>
        <BottomNav />
      </Layout>
    </ConfigProvider>
  );
}
