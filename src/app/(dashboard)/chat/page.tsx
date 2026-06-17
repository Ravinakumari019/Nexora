'use client';

import { useChatStore } from '@/store/use-chat-store';
import { ChatSidebar } from '@/features/chat/components/chat-sidebar';
import { ChatArea } from '@/features/chat/components/chat-area';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const { activeConversationId } = useChatStore();

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Sidebar - visible on desktop, hidden on mobile when chat is active */}
      <div
        className={cn(
          'h-full w-full md:w-[320px] lg:w-[380px] shrink-0',
          activeConversationId ? 'hidden md:block' : 'block'
        )}
      >
        <ChatSidebar />
      </div>

      {/* Message Area - visible on desktop, hidden on mobile when no active chat */}
      <div
        className={cn(
          'h-full flex-1',
          activeConversationId ? 'block' : 'hidden md:block'
        )}
      >
        <ChatArea />
      </div>
    </div>
  );
}
