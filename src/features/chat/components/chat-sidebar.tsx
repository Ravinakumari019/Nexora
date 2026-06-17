'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Search, MessageSquare, Users, Loader2 } from 'lucide-react';
import { useChatStore, ChatConversation } from '@/store/use-chat-store';
import { NewConversationModal } from './new-conversation-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useSocket } from '@/components/socket-provider';

export function ChatSidebar() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    fetchConversations,
    loadingConversations,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const { onlineUsers } = useSocket();

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId, fetchConversations]);

  // Helper to format last message timestamp
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();

    // Reset times to check date difference
    const diffDays = Math.floor(
      (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
        new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Helper to resolve conversation display details
  const getConversationDetails = (conversation: ChatConversation) => {
    const others = conversation.participants.filter((p) => p.id !== currentUserId);
    const isGroup = !!conversation.title || others.length > 1;

    let displayTitle = '';
    let displayImage: string | null = null;
    let displayFallback = '';

    if (conversation.title) {
      displayTitle = conversation.title;
      displayFallback = conversation.title.substring(0, 2).toUpperCase();
    } else if (others.length > 0) {
      displayTitle = others.map((o) => o.name || o.email).join(', ');
      displayImage = others[0].image;
      displayFallback = (others[0].name || others[0].email).substring(0, 2).toUpperCase();
    } else {
      displayTitle = 'Saved Messages (You)';
      displayImage = session?.user?.image || null;
      displayFallback = (session?.user?.name || 'ME').substring(0, 2).toUpperCase();
    }

    return {
      displayTitle,
      displayImage,
      displayFallback,
      isGroup,
    };
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const { displayTitle } = getConversationDetails(c);
    const matchesSearch = displayTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-sidebar overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <h2 className="font-heading text-xl font-bold tracking-tight">Messages</h2>
        <Button
          size="sm"
          onClick={() => setModalOpen(true)}
          className="h-8 w-8 rounded-lg p-0 shadow-md shadow-primary/10"
          aria-label="New chat"
        >
          <Plus size={18} />
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3 relative">
        <Search className="absolute left-7 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 bg-background/50 border-border"
        />
      </div>

      <Separator />

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loadingConversations && conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs">Loading conversations...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground px-4">
            <MessageSquare size={28} className="opacity-40 mb-2" />
            <p className="text-sm font-medium">No conversations found</p>
            <p className="text-xs text-muted-foreground/80 mt-1 max-w-[200px]">
              Start a new chat to connect with others on Nexora.
            </p>
          </div>
        ) : (
          filteredConversations.map((c) => {
            const isActive = activeConversationId === c.id;
            const details = getConversationDetails(c);
            const latestMsg = c.messages?.[0];
            const latestTime = formatTime(c.updatedAt);

            // Check online presence for 1-on-1 chats
            const othersList = c.participants.filter((p) => p.id !== currentUserId);
            const isOnline = othersList.length === 1 && onlineUsers.includes(othersList[0].id);

            return (
              <button
                key={c.id}
                onClick={() => setActiveConversationId(c.id)}
                className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all duration-200 border border-transparent ${
                  isActive
                    ? 'bg-primary/15 text-primary border-primary/10'
                    : 'hover:bg-accent hover:text-foreground text-foreground'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0 mt-0.5">
                  <Avatar className="h-11 w-11 border border-border">
                    {details.displayImage && !details.isGroup ? (
                      <AvatarImage src={details.displayImage} alt={details.displayTitle} referrerPolicy="no-referrer" />
                    ) : null}
                    <AvatarFallback className={`${isActive ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'} font-semibold text-sm`}>
                      {details.isGroup ? (
                        <Users size={16} />
                      ) : (
                        details.displayFallback
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-sidebar ring-0" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-sm font-semibold truncate pr-2">
                      {details.displayTitle}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                      {latestTime}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate leading-relaxed">
                    {latestMsg ? (
                      <>
                        <span className="font-medium mr-1">
                          {latestMsg.authorId === currentUserId ? 'You:' : `${latestMsg.author.name || 'User'}:`}
                        </span>
                        {latestMsg.content}
                      </>
                    ) : (
                      <span className="italic">No messages yet</span>
                    )}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* New conversation modal trigger */}
      <NewConversationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
