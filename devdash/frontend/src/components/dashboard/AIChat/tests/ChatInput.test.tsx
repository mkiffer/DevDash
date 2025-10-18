// devdash/frontend/src/components/dashboard/AIChat/ChatInput.test.tsx
import { render, screen, fireEvent} from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { ChatInput } from '../ChatInput';

describe('ChatInput', () => {
  it('should call onSend with the input value when the send button is clicked', () => {
    const onSendMock = vi.fn();
    render(<ChatInput onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button');

    fireEvent.change(textarea, { target: { value: 'Hello, world!' } });
    fireEvent.click(sendButton);

    expect(onSendMock).toHaveBeenCalledWith('Hello, world!');
    expect(textarea).toHaveValue('');
  });

  it('should disable the send button when the input is empty', () => {
    render(<ChatInput onSend={() => {}} />);
    const sendButton = screen.getByRole('button');
    expect(sendButton).toBeDisabled();
  });

  it('should disable the input and button when the disabled prop is true', () => {
    render(<ChatInput onSend={() => {}} disabled />);
    const textarea = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button');

    expect(textarea).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('should not be able to send blank input', () => {
    const onSendMock = vi.fn();
    render(<ChatInput onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button');

    expect(sendButton).toBeDisabled();
    fireEvent.click(sendButton);
    expect(onSendMock).not.toBeCalled();

    fireEvent.change(textarea, { target: { value: '    ' } });

    fireEvent.click(sendButton);
    expect(onSendMock).not.toBeCalled();
  });

  it('should send message if enter key is pressed', () => {

    const onSendMock = vi.fn();
    render(<ChatInput onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText('Type your message...');

    fireEvent.change(textarea, { target: { value: 'Hello, world!' } });
    fireEvent.keyDown(textarea, {key: 'Enter', charCode: 13});

    expect(onSendMock).toHaveBeenCalledWith('Hello, world!');
    expect(textarea).toHaveValue('');
  });

    it('should send add new line if shift + enter key is pressed', () => {

    const onSendMock = vi.fn();
    render(<ChatInput onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText('Type your message...');

    fireEvent.change(textarea, { target: { value: 'Hello, world!' } });
    fireEvent.keyDown(textarea, {key: 'Enter', shiftKey: true});

    expect(onSendMock).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('Hello, world!\n');
  });


});