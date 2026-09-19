'use client';

import { useChatSession } from '@/modules/chat/presentation/hooks/use-chat-session';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';

export function ChatView() {
  const { messages, sendMessage, isLoading, error, startNewConversation } = useChatSession();

  return (
    <div className="flex h-screen flex-col bg-zinc-900">
      <div className="flex justify-end border-b border-zinc-800 p-3">
        <button
          type="button"
          onClick={() => void startNewConversation()}
          disabled={isLoading}
          className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-100 disabled:opacity-50"
        >
          Nueva conversación
        </button>
      </div>
      <MessageList messages={messages} isLoading={isLoading} />
      {error && (
        <div role="alert" className="mx-4 mb-2 rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
      <MessageInput sendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
}
