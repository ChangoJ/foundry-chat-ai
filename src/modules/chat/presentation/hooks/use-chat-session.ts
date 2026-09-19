import { useState, useEffect, useCallback } from 'react';
import type { Message } from '@/modules/chat/domain/entities/message';

interface UseChatSessionReturn {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  startNewConversation: () => Promise<void>;
}

async function initSession(): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: null, conversationId: null }),
  });
  const data = (await response.json()) as { conversationId?: string; error?: string };
  if (!response.ok) throw new Error(data.error ?? 'Error al inicializar la conversación');
  if (!data.conversationId) throw new Error('Respuesta sin conversationId');
  return data.conversationId;
}

export function useChatSession(): UseChatSessionReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    initSession()
      .then((id) => { if (!cancelled) setConversationId(id); })
      .catch((err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Error desconocido'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, conversationId }),
      });
      const data = (await response.json()) as { content?: string; conversationId?: string; error?: string };
      if (!response.ok) {
        setError(data.error ?? 'Error al enviar el mensaje');
        return;
      }
      const agentMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content ?? '',
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const startNewConversation = useCallback(async () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setIsLoading(true);

    try {
      const id = await initSession();
      setConversationId(id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { messages, sendMessage, isLoading, error, startNewConversation };
}
