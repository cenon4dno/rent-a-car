'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { sendMessage, ConversationMessage, Conversation } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

interface Props {
  conversation: (Conversation & { messages: ConversationMessage[] }) | null;
  currentUserId: string;
  apiToken: string;
}

export function ConversationThread({ conversation: initial, currentUserId, apiToken }: Props) {
  const [messages, setMessages] = useState<ConversationMessage[]>(initial?.messages ?? []);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!initial?.id) return;
    const socket = io(`${API_URL}/ws`, { auth: { token: apiToken } });
    socketRef.current = socket;

    socket.on(
      'message:new',
      (payload: { conversationId: string; message: ConversationMessage }) => {
        if (payload.conversationId === initial.id) {
          setMessages((prev) => [...prev, payload.message]);
        }
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [initial?.id, apiToken]);

  const handleSend = useCallback(async () => {
    if (!body.trim() || !initial?.id) return;
    setSending(true);
    const text = body.trim();
    setBody('');
    try {
      const res = await sendMessage(initial.id, text, apiToken);
      setMessages((prev) => [...prev, res.data]);
    } catch {
      setBody(text);
    } finally {
      setSending(false);
    }
  }, [body, initial?.id, apiToken]);

  if (!initial) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Conversation not found.</p>
        <Link href="/messages" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
          Back to inbox
        </Link>
      </div>
    );
  }

  const other = initial.participants.find((p) => p.userId !== currentUserId);
  const otherName = other?.user.name ?? 'Unknown';

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/messages" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
          {otherName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{otherName}</p>
          {initial.booking && (
            <p className="text-xs text-blue-600">
              Re: {initial.booking.vehicle.make} {initial.booking.vehicle.model}{' '}
              {initial.booking.vehicle.year}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('en-PH', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={sending || !body.trim()}
          className="bg-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
