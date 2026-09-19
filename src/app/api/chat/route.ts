import type { NextRequest } from 'next/server';

import { getStartConversationUseCase, getSendMessageUseCase } from '@/core/di/chat.container';
import type { ChatRequestDto } from '@/modules/chat/application/dtos/chat.dto';
import { FoundryConnectionError } from '@/modules/chat/domain/errors/foundry-connection-error';

export async function POST(request: NextRequest): Promise<Response> {
  let body: ChatRequestDto;

  try {
    body = (await request.json()) as ChatRequestDto;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { content, conversationId } = body;

  try {
    if (content === null && conversationId === null) {
      const newConversationId = await getStartConversationUseCase().execute();
      return Response.json({ conversationId: newConversationId });
    }

    if (typeof content === 'string' && typeof conversationId === 'string') {
      const agentContent = await getSendMessageUseCase().execute(conversationId, content);
      return Response.json({ content: agentContent, conversationId });
    }

    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  } catch (error) {
    if (error instanceof FoundryConnectionError) {
      return Response.json({ error: error.message }, { status: 502 });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
