'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Users, Smile, Paperclip, Loader2, MessageSquare, ChevronLeft, Sparkles } from 'lucide-react';
import { useChatStore, ChatMessage } from '@/store/use-chat-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useSocket } from '@/components/socket-provider';
import { SummarizeModal } from './summarize-modal';

export function ChatArea() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const {
    activeConversationId,
    conversations,
    messages,
    fetchMessages,
    sendMessage,
    loadingMessages,
    setActiveConversationId,
  } = useChatStore();

  const { joinRoom, leaveRoom, emitTyping, typingUsers, onlineUsers } = useSocket();

  const [inputContent, setInputContent] = useState('');
  const [sending, setSending] = useState(false);
  const [summarizeOpen, setSummarizeOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Resolve current active conversation data
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  // Fetch initial messages and manage room join/leave
  useEffect(() => {
    if (!activeConversationId) return;

    fetchMessages(activeConversationId);
    joinRoom(activeConversationId);

    return () => {
      leaveRoom(activeConversationId);
      // Clean up typing state on unmount or switch
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [activeConversationId, fetchMessages, joinRoom, leaveRoom]);

  // Scroll to bottom when messages count increases
  useEffect(() => {
    if (activeMessages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages.length]);

  // Initial scroll when conversation loads
  useEffect(() => {
    if (activeConversationId) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    }
  }, [activeConversationId]);

  const handleSend = async () => {
    if (!activeConversationId || inputContent.trim() === '' || sending) return;

    setSending(true);
    const content = inputContent.trim();
    setInputContent(''); // clear immediately

    // Stop typing immediately on send
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    emitTyping(activeConversationId, false);

    try {
      const msg = await sendMessage(activeConversationId, content);
      if (!msg) {
        toast.error('Failed to send message');
        setInputContent(content); // restore content
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
      setInputContent(content);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputContent(e.target.value);

    if (activeConversationId) {
      // Broadcast typing:start
      emitTyping(activeConversationId, true);

      // Debounce typing:stop
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(activeConversationId, false);
        typingTimeoutRef.current = null;
      }, 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeConversationId || !activeConversation) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background/50 p-6 text-center text-muted-foreground">
        <div className="bg-primary/5 border border-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl mb-4 text-primary shadow-lg shadow-primary/5">
          <MessageSquare size={28} />
        </div>
        <h3 className="font-heading text-lg font-bold text-foreground">Welcome to Nexora Chat</h3>
        <p className="text-sm text-muted-foreground/80 mt-1 max-w-[280px]">
          Select an active chat from the sidebar or click the plus button to start a new direct or group message.
        </p>
      </div>
    );
  }

  // Resolve chat header info
  const others = activeConversation.participants.filter((p) => p.id !== currentUserId);
  const isGroup = !!activeConversation.title || others.length > 1;

  let displayTitle = '';
  let displayImage: string | null = null;
  let displayFallback = '';

  if (activeConversation.title) {
    displayTitle = activeConversation.title;
    displayFallback = activeConversation.title.substring(0, 2).toUpperCase();
  } else if (others.length > 0) {
    displayTitle = others.map((o) => o.name || o.email).join(', ');
    displayImage = others[0].image;
    displayFallback = (others[0].name || others[0].email).substring(0, 2).toUpperCase();
  } else {
    displayTitle = 'Saved Messages (You)';
    displayImage = session?.user?.image || null;
    displayFallback = (session?.user?.name || 'ME').substring(0, 2).toUpperCase();
  }

  // Helper to format individual message timestamp
  const formatMsgTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-full w-full flex-col bg-background/30 overflow-hidden">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-border bg-background/50 px-4 sm:px-6 backdrop-blur-sm shrink-0">
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Back Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveConversationId(null)}
              className="h-9 w-9 rounded-xl p-0 text-muted-foreground hover:text-foreground md:hidden shrink-0"
              aria-label="Back to conversations"
            >
              <ChevronLeft size={20} />
            </Button>

            <Avatar className="h-10 w-10 border border-border">
              {displayImage && !isGroup ? (
                <AvatarImage src={displayImage} alt={displayTitle} referrerPolicy="no-referrer" />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {isGroup ? <Users size={16} /> : displayFallback}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate max-w-[140px] sm:max-w-[300px]">
                {displayTitle}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {Object.keys(typingUsers).filter((uid) => typingUsers[uid] && currentUserId && uid !== currentUserId).length > 0 ? (
                  <span className="text-primary font-medium animate-pulse">
                    {Object.keys(typingUsers)
                      .filter((uid) => typingUsers[uid] && currentUserId && uid !== currentUserId)
                      .map((uid) => activeConversation.participants.find((p) => p.id === uid)?.name || 'Someone')
                      .join(', ')}{' '}
                    is typing...
                  </span>
                ) : isGroup ? (
                  `${activeConversation.participants.length} members`
                ) : others[0] ? (
                  onlineUsers.includes(others[0].id) ? (
                    <span className="text-emerald-500 font-medium">Online</span>
                  ) : (
                    'Offline'
                  )
                ) : (
                  'Personal chat'
                )}
              </span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSummarizeOpen(true)}
              className="h-9 px-2.5 sm:px-3 rounded-xl gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
              aria-label="Summarize conversation"
            >
              <Sparkles size={16} className="text-primary animate-pulse" />
              <span className="text-xs font-semibold hidden sm:inline">AI Summarize</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {loadingMessages && activeMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm">Loading messages...</span>
          </div>
        ) : activeMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
            <MessageSquare size={32} className="opacity-30 mb-2" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs text-muted-foreground/80 mt-1 max-w-[220px]">
              Type a message below to start the conversation!
            </p>
          </div>
        ) : (
          activeMessages.map((msg: ChatMessage) => {
            const isSelf = msg.authorId === currentUserId;
            const authorInitial = msg.author.name ? msg.author.name.charAt(0).toUpperCase() : 'U';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[70%] ${
                  isSelf ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Peer Avatar */}
                {!isSelf && (
                  <Avatar className="h-8 w-8 border border-border shrink-0 mt-0.5">
                    {msg.author.image ? (
                      <AvatarImage src={msg.author.image} alt={msg.author.name || 'User'} referrerPolicy="no-referrer" />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                      {authorInitial}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className="space-y-1">
                  {/* Author Name for groups */}
                  {!isSelf && isGroup && (
                    <span className="text-[10px] text-muted-foreground font-medium pl-1">
                      {msg.author.name || 'User'}
                    </span>
                  )}

                  {/* Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm break-words select-text ${
                      isSelf
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-accent text-accent-foreground rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <div
                      className={`text-[9px] mt-1 text-right block ${
                        isSelf ? 'text-primary-foreground/75' : 'text-muted-foreground'
                      }`}
                    >
                      {formatMsgTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 bg-background/50 shrink-0">
        <div className="max-w-4xl mx-auto flex items-end gap-2 bg-background border border-border rounded-2xl p-2.5 shadow-sm">
          {/* Attachment button placeholder */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-9 rounded-xl p-0 text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Attach file"
          >
            <Paperclip size={18} />
          </Button>

          {/* Text input */}
          <Textarea
            rows={1}
            value={inputContent}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            className="min-h-0 py-2.5 px-1 bg-transparent border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none max-h-32 text-sm"
          />

          {/* Send buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Emoji placeholder */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 rounded-xl p-0 text-muted-foreground hover:text-foreground hidden sm:flex"
              aria-label="Add emoji"
            >
              <Smile size={18} />
            </Button>

            {/* Submit */}
            <Button
              type="button"
              size="sm"
              onClick={handleSend}
              disabled={sending || inputContent.trim() === ''}
              className="h-9 px-4 rounded-xl shadow-md shadow-primary/15 shrink-0"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send size={14} className="mr-1.5" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      {/* Summarize modal trigger */}
      <SummarizeModal
        isOpen={summarizeOpen}
        onClose={() => setSummarizeOpen(false)}
        conversationId={activeConversationId}
        conversationTitle={displayTitle}
      />
    </div>
  );
}
