// client/src/Components/PaymentModal.jsx
import { Modal, Radio, Form, Input, DatePicker, Row, Col } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import PropTypes from 'prop-types';

export default function PaymentModal({ open, onCancel, onAdd }) {
  const [payType, setPayType] = useState('card');
  const [form] = Form.useForm();

  const handleAdd = (values) => {
    const methodData =
      payType === 'card'
        ? {
            kind: 'card',
            cardName: values.cardName,
            cardNumber: values.cardNumber,
            expiry: values.expiry ? dayjs(values.expiry).format('MM/YY') : '',
            cvv: values.cvv,
            title: `•••• ${values.cardNumber?.slice(-4)}`,
            subtitle: `Expires ${dayjs(values.expiry).format('MM/YY')}`,
          }
        : {
            kind: 'bank',
            accountName: values.accountName,
            bankName: values.bankName,
            accountNumber: values.accountNumber,
            branchCode: values.branchCode,
            title: values.bankName || 'Bank Account',
            subtitle: `•••• ${values.accountNumber?.slice(-4)}`,
          };

    onAdd(methodData);
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      open={open}
      title="Add Payment Method"
      onCancel={onCancel}
      okText="Save"
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Radio.Group
        value={payType}
        onChange={(e) => setPayType(e.target.value)}
        style={{ marginBottom: 16 }}
      >
        <Radio.Button value="card">Card</Radio.Button>
        <Radio.Button value="bank">Bank</Radio.Button>
      </Radio.Group>

      <Form form={form} layout="vertical" onFinish={handleAdd} preserve={false}>
        {payType === 'card' ? (
          <>
            <Form.Item
              label="Cardholder Name"
              name="cardName"
              rules={[{ required: true, message: 'Please enter cardholder name' }]}
            >
              <Input placeholder="e.g., S. Perera" />
            </Form.Item>
            <Form.Item
              label="Card Number"
              name="cardNumber"
              rules={[
                { required: true, message: 'Please enter card number' },
                { pattern: /^[0-9\s]{12,19}$/, message: 'Enter a valid card number' },
              ]}
            >
              <Input placeholder="xxxx xxxx xxxx 1234" maxLength={19} />
            </Form.Item>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label="Expiry"
                  name="expiry"
                  rules={[{ required: true, message: 'Select expiry month' }]}
                >
                  <DatePicker picker="month" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="CVV"
                  name="cvv"
                  rules={[
                    { required: true, message: 'Enter CVV' },
                    { pattern: /^[0-9]{3,4}$/, message: '3–4 digits' },
                  ]}
                >
                  <Input placeholder="123" maxLength={4} />
                </Form.Item>
              </Col>
            </Row>
          </>
        ) : (
          <>
            <Form.Item
              label="Account Holder Name"
              name="accountName"
              rules={[{ required: true, message: 'Please enter account holder name' }]}
            >
              <Input placeholder="e.g., S. Perera" />
            </Form.Item>
            <Form.Item
              label="Bank Name"
              name="bankName"
              rules={[{ required: true, message: 'Please enter bank name' }]}
            >
              <Input placeholder="e.g., Bank of Ceylon" />
            </Form.Item>
            <Form.Item
              label="Account Number"
              name="accountNumber"
              rules={[
                { required: true, message: 'Please enter account number' },
                { pattern: /^[0-9-]{6,20}$/, message: 'Enter a valid account number' },
              ]}
            >
              <Input placeholder="xxxxxxxxxx" maxLength={20} />
            </Form.Item>
            <Form.Item label="Branch Code" name="branchCode">
              <Input placeholder="optional" />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}

PaymentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};
