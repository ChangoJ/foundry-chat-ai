'use client';

import { useChatSession } from '@/modules/chat/presentation/hooks/use-chat-session';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';

export function ChatView() {
  const { messages, sendMessage, isLoading } = useChatSession();

  return (
    <div className="flex flex-1 flex-col">
      <MessageList messages={messages} />
      <MessageInput sendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
}
