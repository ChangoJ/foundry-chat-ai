'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@/modules/chat/domain/entities/message';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[75%] whitespace-pre-wrap rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-700 text-zinc-100'
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="flex gap-1 rounded-lg bg-zinc-700 px-4 py-3">
            <span
              className="inline-block h-2 w-2 animate-bounce rounded-full bg-zinc-400"
              style={{ animationDelay: '-0.3s' }}
            />
            <span
              className="inline-block h-2 w-2 animate-bounce rounded-full bg-zinc-400"
              style={{ animationDelay: '-0.15s' }}
            />
            <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-zinc-400" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
