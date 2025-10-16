// PaymentModal.test.js

// ----------------------
// Mocks (must be before component import)
// ----------------------
/* eslint-disable global-require */
/* eslint-disable react/prop-types */
/* eslint-enable global-require */

// ----------------------
// Tests
// ----------------------
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import dayjs from 'dayjs';
import PaymentModal from './PaymentModal';

const mockFormInstance = {
  resetFields: jest.fn(),
  validateFields: jest.fn().mockResolvedValue({}),
  setFieldsValue: jest.fn(),
  getFieldValue: jest.fn(),
  submit: jest.fn(),
};

jest.mock('antd', () => {
  const React = require('react');

  // Make Form a functional component so <Form> works in JSX,
  // and attach useForm and Item to it.
  const Form = React.forwardRef((props, ref) =>
    React.createElement(
      'form',
      {
        ref,
        'data-testid': 'mock-form',
        onSubmit: (e) => {
          e.preventDefault();
          props.onFinish?.(mockFormInstance.getFieldValue());
        },
      },
      props.children
    )
  );

  Form.useForm = () => [mockFormInstance];
  Form.Item = React.forwardRef((props, ref) =>
    React.createElement('div', { ref }, [
      React.createElement('label', { key: 'label' }, props.label),
      props.children,
    ])
  );

  // Modal component that respects "open" prop and renders footer buttons
  const Modal = React.forwardRef((props, ref) => {
    if (!props.open) return null;

    return React.createElement('div', { ref, 'data-testid': 'mock-modal' }, [
      props.children,
      React.createElement('div', { key: 'footer', className: 'modal-footer' }, [
        React.createElement(
          'button',
          {
            key: 'cancel',
            onClick: props.onCancel,
            type: 'button',
            className: 'ant-btn-default',
          },
          'Cancel'
        ),
        React.createElement(
          'button',
          {
            key: 'ok',
            onClick: props.onOk, // Use onOk from props
            type: 'button',
            className: 'ant-btn-primary',
          },
          props.okText || 'OK'
        ),
      ]),
    ]);
  });

  // Radio component with Group and Button subcomponents
  const Radio = React.forwardRef((props, ref) =>
    React.createElement('div', { ref }, props.children)
  );
  Radio.Group = React.forwardRef((props, ref) =>
    React.createElement(
      'div',
      { ref },
      React.Children.map(props.children, (child) =>
        React.cloneElement(child, {
          onClick: () => props.onChange?.({ target: { value: child.props.value } }),
        })
      )
    )
  );
  Radio.Button = React.forwardRef((props, ref) =>
    React.createElement(
      'button',
      {
        ref,
        onClick: props.onClick,
        value: props.value,
      },
      props.children
    )
  ); // Simple Input, DatePicker, Row, Col components
  const Input = React.forwardRef((props, ref) => React.createElement('input', { ref, ...props }));
  const DatePicker = React.forwardRef((props, ref) =>
    React.createElement('input', { ref, type: 'month', ...props })
  );
  const Row = React.forwardRef((props, ref) => React.createElement('div', { ref }, props.children));
  const Col = React.forwardRef((props, ref) => React.createElement('div', { ref }, props.children));

  // message API mock
  const message = {
    success: jest.fn(),
    error: jest.fn(),
  };

  // Export everything your PaymentModal may import from 'antd'
  return {
    Modal,
    Form,
    Radio,
    Input,
    DatePicker,
    Row,
    Col,
    message,
  };
});

// Mock dayjs
jest.mock('dayjs', () => {
  const actualDayjs = jest.requireActual('dayjs');
  const dayjsMock = (date) => actualDayjs(date);
  dayjsMock.extend = jest.fn();
  dayjsMock.format = jest.fn(() => 'MM/YY'); // Mock format function
  Object.assign(dayjsMock, actualDayjs);
  return dayjsMock;
});

// Mock ant-design icons (avoid JSX in factory)
jest.mock('@ant-design/icons', () => {
  const React = require('react');
  return {
    CreditCardOutlined: () => React.createElement('span', null, 'CreditCard'),
    BankOutlined: () => React.createElement('span', null, 'Bank'),
    // add other icons your component uses here
  };
});

describe('PaymentModal', () => {
  let consoleSpy;
  const mockOnAdd = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    mockOnAdd.mockClear();
    mockOnCancel.mockClear();
    // Reset form instance mocks
    mockFormInstance.resetFields.mockClear();
    mockFormInstance.validateFields.mockClear();
    mockFormInstance.submit.mockClear();
    mockFormInstance.getFieldValue.mockClear();
  });

  beforeAll(() => {
    // Suppress console.error output from React during tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('renders without crashing and shows modal content when open', () => {
    render(<PaymentModal open={true} onCancel={mockOnCancel} onAdd={mockOnAdd} />);

    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    expect(screen.getByTestId('mock-form')).toBeInTheDocument();
    expect(screen.getByText('Card')).toBeInTheDocument();
    expect(screen.getByText('Bank')).toBeInTheDocument();
  });

  it('should not render when open is false', () => {
    render(<PaymentModal open={false} onCancel={mockOnCancel} onAdd={mockOnAdd} />);

    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
  });

  it('shows credit card form fields by default', () => {
    render(<PaymentModal open={true} onCancel={mockOnCancel} onAdd={mockOnAdd} />);

    // Check for card-specific fields
    expect(screen.getByText('Cardholder Name')).toBeInTheDocument();
    expect(screen.getByText('Card Number')).toBeInTheDocument();
    expect(screen.getByText('Expiry')).toBeInTheDocument();
    expect(screen.getByText('CVV')).toBeInTheDocument();

    // Bank fields should not be present
    expect(screen.queryByText('Account Holder Name')).not.toBeInTheDocument();
    expect(screen.queryByText('Bank Name')).not.toBeInTheDocument();
  });

  it('switches between card and bank forms', async () => {
    render(<PaymentModal open={true} onCancel={mockOnCancel} onAdd={mockOnAdd} />);

    // Initially card form should be visible
    expect(screen.getByText('Card Number')).toBeInTheDocument();
    expect(screen.queryByText('Bank Name')).not.toBeInTheDocument();

    // Click the Bank button
    fireEvent.click(screen.getByText('Bank'));

    // Should show bank fields
    expect(await screen.findByText('Bank Name')).toBeInTheDocument();
    expect(screen.queryByText('Card Number')).not.toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<PaymentModal open={true} onCancel={mockOnCancel} onAdd={mockOnAdd} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls form.submit on clicking Save', () => {
    render(<PaymentModal open={true} onCancel={mockOnCancel} onAdd={mockOnAdd} />);
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    expect(mockFormInstance.submit).toHaveBeenCalled();
  });

  it('handles successful form submission via onFinish', async () => {
    const mockExpiry = dayjs('2024-12');
    const mockValues = {
      cardName: 'John Doe',
      cardNumber: '4111111111111111',
      expiry: mockExpiry,
      cvv: '123',
    };

    // Mock what the form would return
    mockFormInstance.getFieldValue.mockReturnValue(mockValues);

    render(<PaymentModal open={true} onCancel={mockOnCancel} onAdd={mockOnAdd} />);

    // Directly trigger the form submission
    fireEvent.submit(screen.getByTestId('mock-form'));

    // Let promises resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Verify form data was processed correctly
    expect(mockOnAdd).toHaveBeenCalledWith({
      kind: 'card',
      cardName: mockValues.cardName,
      cardNumber: mockValues.cardNumber,
      expiry: mockExpiry.format('MM/YY'),
      cvv: mockValues.cvv,
      title: `•••• ${mockValues.cardNumber.slice(-4)}`,
      subtitle: `Expires ${mockExpiry.format('MM/YY')}`,
    });

    // Verify cleanup actions
    expect(mockFormInstance.resetFields).toHaveBeenCalled();
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
