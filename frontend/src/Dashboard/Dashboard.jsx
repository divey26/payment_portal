import React from 'react';
import {
  Layout,
  Card,
  Typography,
  Row,
  Col,
  Space,
  Button,
  Tag,
  Avatar,
  List,
  Divider,
  Badge,
} from 'antd';
import {
  HomeOutlined,
  HistoryOutlined,
  CreditCardOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  RightOutlined,
  CalendarOutlined,
  InboxOutlined,
  GiftOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

export default function Dashboard() {
  // Mock data
  const balance = 1025.44;
  const nextCollection = { label: 'Tomorrow, 9AM' };
  const stats = [
    {
      key: 'waste',
      title: 'Waste this month',
      value: '32kg',
      delta: '+12%',
      icon: <InboxOutlined />,
      deltaColor: '#16a34a',
    },
    {
      key: 'points',
      title: 'Recycling points',
      value: '120',
      delta: '+8%',
      icon: <GiftOutlined />,
      deltaColor: '#16a34a',
    },
  ];
  const activities = [
    {
      title: 'General Waste Collected',
      subtitle: '18kg collected from your bin',
      when: 'Today',
    },
    {
      title: 'E-waste Drop-off Scheduled',
      subtitle: 'Laptop & two chargers',
      when: 'Yesterday',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f6f7fb' }}>
      {/* Top App Bar */}
      <Header
        style={{
          background: '#fff',
          height: 64,
          padding: '0 16px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Row align="middle" justify="space-between" gutter={12}>
          <Col>
            <Space align="center">
              <Avatar style={{ background: '#E6F4FF', color: '#1677ff' }}>JD</Avatar>
              <Text strong>Dashboard</Text>
            </Space>
          </Col>
          <Col>
            <Space size="large">
              <Badge dot>
                <BellOutlined style={{ fontSize: 18 }} />
              </Badge>
              <SettingOutlined style={{ fontSize: 18 }} />
            </Space>
          </Col>
        </Row>
      </Header>

      <Content style={{ padding: 16, paddingBottom: 88 }}>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          {/* Balance Card */}
          <div
            style={{
              borderRadius: 16,
              padding: 16,
              background: 'linear-gradient(135deg, rgba(42,194,133,1) 0%, rgba(45,158,224,1) 100%)',
              color: '#fff',
              boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
              height: 170,
            }}
          >
            <Row justify="space-between" align="top">
              <Col>
                <Space direction="vertical" size={6}>
                  <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Current Balance</Text>

                  <Title
                    level={2}
                    style={{ color: '#fff', margin: 0, lineHeight: 1.1 }}
                    marginTop={10}
                  >
                    LKR{' '}
                    {balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </Title>

                  <br />
                  <br />
                  <Space size={8} align="center">
                    <CalendarOutlined />
                    <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Next Collection</Text>
                    <Text strong style={{ color: '#fff' }}>
                      {nextCollection.label}
                    </Text>
                  </Space>
                </Space>
              </Col>
              <Col>
                <Space direction="vertical" align="end">
                  <Tag
                    color="success"
                    style={{
                      marginRight: 0,
                      borderRadius: 32,
                      padding: '2px 10px',
                      background: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      border: 'none',
                    }}
                  >
                    Paid
                  </Tag>
                  <Button
                    size="small"
                    type="default"
                    icon={<RightOutlined />}
                    style={{
                      borderRadius: 24,
                      border: 'none',
                      background: 'rgba(255,255,255,0.9)',
                      color: '#1677ff',
                    }}
                  >
                    Details
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>

          {/* Mini Stats */}
          <Row gutter={12}>
            {stats.map((s) => (
              <Col span={12} key={s.key}>
                <Card
                  size="small"
                  style={{
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  }}
                >
                  <Space direction="vertical" size={6} style={{ width: '100%' }}>
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Avatar
                          size={32}
                          style={{ background: '#F6FFED', color: '#52c41a' }}
                          icon={s.icon}
                        />
                      </Col>
                      <Col>
                        <Text strong style={{ color: s.deltaColor }}>
                          {s.delta}
                        </Text>
                      </Col>
                    </Row>
                    <Title level={4} style={{ margin: 0 }}>
                      {s.value}
                    </Title>
                    <Text type="secondary">{s.title}</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Promo / CTA Card */}
          <Card
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(76,201,240,1) 0%, rgba(42,194,133,1) 100%)',
              color: '#fff',
              boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
            }}
            bodyStyle={{ padding: 16 }}
          >
            <Row justify="space-between" align="middle" gutter={12}>
              <Col flex="auto">
                <Space direction="vertical" size={4}>
                  <Text strong style={{ color: '#fff' }}>
                    Recycle E-Waste
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                    Schedule a dropoff for electronics
                  </Text>
                </Space>
              </Col>
              <Col>
                <Tag
                  style={{
                    borderRadius: 24,
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    border: 'none',
                    marginRight: 0,
                  }}
                >
                  Earn Points
                </Tag>
                <div style={{ marginTop: 8, textAlign: 'right' }}>
                  <Button
                    type="default"
                    style={{
                      borderRadius: 24,
                      border: 'none',
                      background: '#fff',
                      color: '#1677ff',
                    }}
                  >
                    Schedule Now
                  </Button>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Quick Actions */}
          <div>
            <Text strong style={{ fontSize: 16 }}>
              Quick Actions
            </Text>
            <Row gutter={12} style={{ marginTop: 12 }}>
              <Col span={12}>
                <Button type="primary" block style={{ height: 44, borderRadius: 12 }}>
                  Schedule Pick up
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  block
                  style={{
                    height: 44,
                    borderRadius: 12,
                    background: '#fff',
                    borderColor: '#1677ff',
                    color: '#1677ff',
                  }}
                >
                  Schedule Drop-off
                </Button>
              </Col>
            </Row>
          </div>

          {/* Recent Activity */}
          <Row align="middle" justify="space-between">
            <Col>
              <Text strong style={{ fontSize: 16 }}>
                Recent Activity
              </Text>
            </Col>
            <Col>
              <Button type="link" size="small">
                View All
              </Button>
            </Col>
          </Row>

          <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 14, overflow: 'hidden' }}>
            <List
              itemLayout="horizontal"
              dataSource={activities}
              renderItem={(item, idx) => (
                <>
                  <List.Item
                    style={{ padding: '12px 16px' }}
                    actions={[<Text type="secondary">{item.when}</Text>]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{ background: '#F6FFED', color: '#52c41a' }}
                          icon={<CheckCircleFilled />}
                        />
                      }
                      title={<Text strong>{item.title}</Text>}
                      description={<Text type="secondary">{item.subtitle}</Text>}
                    />
                  </List.Item>
                  {idx !== activities.length - 1 && <Divider style={{ margin: 0 }} />}
                </>
              )}
            />
          </Card>
        </Space>
      </Content>

      {/* Bottom Nav */}
      <Footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          padding: '8px 12px',
        }}
      >
        <Row justify="space-around" align="middle">
          <Col>
            <Space direction="vertical" align="center" size={2}>
              <HomeOutlined style={{ fontSize: 20, color: '#1677ff' }} />
              <Text style={{ fontSize: 12, color: '#1677ff' }}>Home</Text>
            </Space>
          </Col>
          <Col>
            <Space direction="vertical" align="center" size={2}>
              <HistoryOutlined style={{ fontSize: 20, color: '#667085' }} />
              <Text style={{ fontSize: 12, color: '#667085' }}>History</Text>
            </Space>
          </Col>
          <Col>
            <Space direction="vertical" align="center" size={2}>
              <CreditCardOutlined style={{ fontSize: 20, color: '#667085' }} />
              <Text style={{ fontSize: 12, color: '#667085' }}>Payment</Text>
            </Space>
          </Col>
          <Col>
            <Space direction="vertical" align="center" size={2}>
              <UserOutlined style={{ fontSize: 20, color: '#667085' }} />
              <Text style={{ fontSize: 12, color: '#667085' }}>Profile</Text>
            </Space>
          </Col>
        </Row>
      </Footer>
    </Layout>
  );
}
