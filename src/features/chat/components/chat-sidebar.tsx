'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Search, MessageSquare, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useChatStore, ChatConversation } from '@/store/use-chat-store';
import { NewConversationModal } from './new-conversation-modal';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/search-input';
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
    searchQuery,
    setSearchQuery,
    createConversation,
  } = useChatStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string; image: string | null }[]>([]);
  const [startingChat, setStartingChat] = useState<string | null>(null);

  // Fetch registered users list for live search
  useEffect(() => {
    if (currentUserId) {
      const fetchUsers = async () => {
        try {
          const res = await fetch('/api/users');
          if (res.ok) {
            const data = await res.json();
            setUsers(data);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchUsers();
    }
  }, [currentUserId]);

  const handleStartChat = async (userId: string) => {
    setStartingChat(userId);
    try {
      const conv = await createConversation([userId]);
      if (conv) {
        setSearchQuery('');
        toast.success('Conversation started!');
      } else {
        toast.error('Failed to start conversation');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error starting conversation');
    } finally {
      setStartingChat(null);
    }
  };

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

  // Filter people matching search query who don't have an active conversation already
  const filteredUsers = searchQuery.trim() !== ''
    ? users.filter((u) => {
        const matchesSearch =
          (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()));

        // Exclude users we already have a direct chat with
        const alreadyHasDirectChat = conversations.some((c) => {
          const others = c.participants.filter((p) => p.id !== currentUserId);
          return !c.title && others.length === 1 && others[0].id === u.id;
        });

        return matchesSearch && !alreadyHasDirectChat;
      })
    : [];

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
      <div className="px-4 pb-3">
        <SearchInput
          placeholder="Search chats..."
          value={searchQuery}
          onSearch={setSearchQuery}
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
        ) : searchQuery.trim() !== '' && filteredConversations.length === 0 && filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground px-4 animate-fadeIn">
            <MessageSquare size={28} className="opacity-40 mb-2" />
            <p className="text-sm font-medium">No matches found</p>
            <p className="text-xs text-muted-foreground/80 mt-1 max-w-[200px]">
              No chats or registered users matched '{searchQuery}'.
            </p>
          </div>
        ) : (
          <>
            {/* Conversations List */}
            {filteredConversations.length > 0 && (
              <div className="space-y-1">
                {searchQuery.trim() !== '' && (
                  <div className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider px-3 py-1.5 mt-1 select-none">
                    Conversations
                  </div>
                )}
                {filteredConversations.map((c) => {
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
                          ? 'bg-primary/15 text-primary border-primary/10 font-medium'
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
                            {details.isGroup ? <Users size={16} /> : details.displayFallback}
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
                })}
              </div>
            )}

            {/* People List */}
            {filteredUsers.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider px-3 py-1.5 mt-4 select-none">
                  People
                </div>
                {filteredUsers.map((u) => {
                  const initial = u.name ? u.name.charAt(0).toUpperCase() : 'U';
                  const isOnline = onlineUsers.includes(u.id);
                  const isStarting = startingChat === u.id;

                  return (
                    <button
                      key={u.id}
                      onClick={() => handleStartChat(u.id)}
                      disabled={isStarting}
                      className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-accent hover:text-foreground text-foreground transition-all duration-200 border border-transparent disabled:opacity-50"
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0 mt-0.5">
                        <Avatar className="h-11 w-11 border border-border">
                          {u.image && <AvatarImage src={u.image} alt={u.name || 'User'} referrerPolicy="no-referrer" />}
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                            {initial}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-sidebar ring-0" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold truncate block">
                          {u.name || 'User'}
                        </span>
                        <span className="text-xs text-muted-foreground truncate block leading-normal">
                          {isStarting ? 'Starting chat...' : 'Click to start chat'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* New conversation modal trigger */}
      <NewConversationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
