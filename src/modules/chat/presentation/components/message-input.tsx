'use client';

import { useState } from 'react';

interface MessageInputProps {
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
}

export function MessageInput({ sendMessage, isLoading }: MessageInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    setValue('');
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div className="flex gap-2 border-t border-zinc-700 p-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        placeholder="Escribe un mensaje..."
        className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:opacity-50"
      />
      <button
        onClick={() => void handleSubmit()}
        disabled={isLoading || !value.trim()}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        Enviar
      </button>
    </div>
  );
}
