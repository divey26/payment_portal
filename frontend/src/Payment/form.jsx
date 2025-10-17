import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Form,
  Input,
  Button,
  Divider,
  message,
  Tag,
  Modal,
} from 'antd';
import {
  LeftOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  HomeOutlined,
  HistoryOutlined,
  CreditCardOutlined,
  UserOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useBalance } from '../context/BalanceContext';
import axios from 'axios';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

export default function PaymentPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { balance, setBalance } = useBalance();
  const [submitting, setSubmitting] = useState(false);
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/payments')
      .then((res) => setMethods(res.data))
      .catch(() => message.error('Failed to fetch payment methods'));
  }, []);

  const timeoutRef = useRef(null);

  // Start the timeout and show a modal when it fires
  const startTimeout = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShowTimeout(true);
    }, 30000); // 30 seconds
  };

  // Clear/stop the timeout
  const clearTimeoutFn = () => {
    clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    startTimeout(); // start on mount
    return () => clearTimeoutFn();
  }, []);

  // Prefill when a method is selected
  useEffect(() => {
    if (selectedMethod) {
      form.setFieldsValue({
        cardNumber: selectedMethod.cardNumber || '',
        expiry: selectedMethod.expiry || '',
        cvc: selectedMethod.cvc || '',
      });
    }
  }, [selectedMethod, form]);

  // ---- helpers ----
  const formatCard = (v = '') =>
    v
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1 ');
  const formatExpiry = (v = '') =>
    v
      .replace(/\D/g, '')
      .slice(0, 4)
      .replace(/(\d{2})(\d{1,2})?/, (_, m, y = '') => (y ? `${m}/${y}` : m));

  const isExpiryValid = (mmYY) => {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(mmYY)) return false;
    const [mmStr, yyStr] = mmYY.split('/');
    const mm = Number(mmStr);
    const yy = Number(yyStr);
    const expYear = 2000 + yy;
    const now = new Date();
    const exp = new Date(expYear, mm, 0, 23, 59, 59);
    return exp >= now;
  };

  // pages/PaymentPage.jsx (inside onFinish)
  const onFinish = async (values) => {
    const amount = parseFloat(values.amount);

    if (isNaN(amount) || amount <= 0) {
      message.warning('Please enter a valid payment amount 💳');
      return;
    }
    if (!isExpiryValid(values.expiry)) {
      message.error('Card has expired or the date is invalid.');
      return;
    }

    setSubmitting(true);

    try {
      // ✅ decide status client-side using your existing logic
      const status = amount <= balance ? 'success' : 'failed';

      const res = await axios.post('http://localhost:5000/api/bills', {
        amount: values.amount,
        paymentMethod: selectedMethod ? selectedMethod._id || selectedMethod.id : null,
        senderName: values.cardName,
        status, // ✅ save it at creation
      });

      if (status === 'success') {
        const newBalance = balance - amount;
        setBalance(newBalance);
        clearTimeoutFn();
        form.resetFields();
        navigate(`/success/${res.data._id}`);
      } else {
        navigate(`/unsuccess/${res.data._id}`);
      }
    } catch (err) {
      clearTimeoutFn();
      message.error('Failed to store payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Top App Bar */}
      <Header
        style={{
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 16px',
          lineHeight: '56px',
          height: 56,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space size={12} align="center">
              <LeftOutlined />
              <Button type="text" onClick={() => navigate('/')}>
                Back
              </Button>
            </Space>
          </Col>
          <Col>
            <Space size={16}>
              <BellOutlined />
              <QuestionCircleOutlined />
            </Space>
          </Col>
        </Row>
      </Header>

      <Content style={{ padding: '16px', paddingBottom: 88 }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {/* Balance card */}
          <Card
            bodyStyle={{ padding: 16 }}
            style={{
              background: '#16A34A',
              border: 'none',
              color: '#fff',
              borderRadius: 12,
            }}
          >
            <Space direction="vertical" size={0} style={{ width: '100%' }}>
              <Title
                level={3}
                style={{
                  color: '#fff',
                  margin: 0,
                  fontWeight: 700,
                  letterSpacing: 0.2,
                }}
              >
                LKR {balance.toFixed(2)}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.95)' }}>Current Balance</Text>
            </Space>
          </Card>

          {/* Payment Methods List */}
          <div>
            <Text strong>Choose a payment method</Text>
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              {methods.map((m) => (
                <Card
                  key={m._id || m.id}
                  size="small"
                  style={{
                    borderRadius: 10,
                    border:
                      selectedMethod &&
                      (selectedMethod._id || selectedMethod.id) === (m._id || m.id)
                        ? '2px solid #20c46b'
                        : '1px solid #f0f0f0',
                    marginBottom: 4,
                    cursor: 'pointer',
                    background:
                      selectedMethod &&
                      (selectedMethod._id || selectedMethod.id) === (m._id || m.id)
                        ? '#e6fff3'
                        : '#fff',
                  }}
                  bodyStyle={{
                    padding: 10,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={() => setSelectedMethod(m)}
                >
                  <span style={{ marginRight: 10 }}>
                    {m.kind === 'bank' ? <BankOutlined /> : <CreditCardOutlined />}
                  </span>
                  <span>
                    <Text strong>{m.title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {m.subtitle}
                    </Text>
                  </span>
                  {m.isDefault && (
                    <Tag color="success" style={{ marginLeft: 'auto' }}>
                      Default
                    </Tag>
                  )}
                </Card>
              ))}
            </Space>
          </div>

          <Divider style={{ margin: '8px 0 0' }} />

          <Text strong>Pay with card</Text>

          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item
              label="Amount"
              name="amount"
              style={{ marginBottom: 12 }}
              rules={[{ required: true, message: 'Please enter amount' }]}
            >
              <Input prefix="LKR" type="number" min={0} inputMode="decimal" />
            </Form.Item>

            <Form.Item
              label="Name"
              name="cardName"
              style={{ marginBottom: 12 }}
              rules={[{ required: true, message: 'Please enter the name' }]}
            >
              <Input size="large" placeholder="Name as on card" maxLength={40} />
            </Form.Item>

            <Text type="secondary" style={{ fontSize: 12 }}>
              Card Information
            </Text>

            <Form.Item
              name="cardNumber"
              style={{ marginTop: 8, marginBottom: 12 }}
              rules={[
                { required: true, message: 'Card number is required' },
                {
                  validator: (_, v) => {
                    const digits = (v || '').replace(/\s/g, '');
                    return digits.length === 16
                      ? Promise.resolve()
                      : Promise.reject(new Error('Enter a 16-digit card number'));
                  },
                },
              ]}
            >
              <Input
                inputMode="numeric"
                size="large"
                placeholder="1234 5678 1234 5678"
                maxLength={19}
                onChange={(e) => form.setFieldValue('cardNumber', formatCard(e.target.value))}
              />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="expiry"
                  style={{ marginBottom: 12 }}
                  rules={[
                    { required: true, message: 'Expiry is required' },
                    {
                      pattern: /^(0[1-9]|1[0-2])\/\d{2}$/,
                      message: 'Use MM/YY',
                    },
                  ]}
                >
                  <Input
                    inputMode="numeric"
                    size="large"
                    placeholder="MM/YY"
                    maxLength={5}
                    onChange={(e) => form.setFieldValue('expiry', formatExpiry(e.target.value))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="cvc"
                  style={{ marginBottom: 12 }}
                  rules={[
                    { required: true, message: 'CVC is required' },
                    { pattern: /^\d{3,4}$/, message: '3–4 digits' },
                  ]}
                >
                  <Input.Password
                    inputMode="numeric"
                    size="large"
                    placeholder="CVC"
                    maxLength={4}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              disabled={submitting}
              loading={submitting}
              style={{
                height: 48,
                borderRadius: 8,
                background: '#16A34A',
                borderColor: '#20c46b',
              }}
            >
              Pay Now
            </Button>
          </Form>
        </Space>
      </Content>

      {/* Bottom nav */}
      <Footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          padding: '6px 8px 10px',
        }}
      >
        <Row justify="space-around" align="middle">
          <NavItem icon={<HomeOutlined />} label="Home" active={false} />
          <NavItem icon={<HistoryOutlined />} label="History" active={false} />
          <NavItem icon={<CreditCardOutlined />} label="Payment" active />
          <NavItem icon={<UserOutlined />} label="Profile" active={false} />
        </Row>
      </Footer>

      {/* ✅ Timeout Popup */}
      <Modal
        centered
        open={showTimeout}
        closable={false}
        maskClosable={false}
        title="Session Timed Out"
        footer={[
          <Button
            key="restart"
            type="primary"
            onClick={() => {
              setShowTimeout(false);
              clearTimeoutFn(); // stop any existing timer
              startTimeout(); // start a fresh one
              message.success('Session restarted');
              navigate('/');
            }}
          >
            Restart Again
          </Button>,
        ]}
      >
        <Text>
          Your payment session timed out after 30 seconds. You can restart the session to continue.
        </Text>
      </Modal>
    </Layout>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <Col>
      <Space direction="vertical" align="center" size={2}>
        <span
          style={{
            fontSize: 20,
            color: active ? '#20c46b' : '#8c8c8c',
            lineHeight: 1,
          }}
        >
          {icon}
        </span>
        <Typography.Text
          style={{
            fontSize: 12,
            color: active ? '#20c46b' : '#8c8c8c',
            fontWeight: active ? 600 : 400,
          }}
        >
          {label}
        </Typography.Text>
        {active && (
          <span
            style={{
              display: 'block',
              width: 28,
              height: 3,
              borderRadius: 999,
              background: '#20c46b',
              marginTop: 2,
            }}
          />
        )}
      </Space>
    </Col>
  );
}
