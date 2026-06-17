import { create } from 'zustand';

export interface ChatUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface ChatConversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ChatUser[];
  messages: ChatMessage[];
}

interface ChatStore {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  messages: Record<string, ChatMessage[]>;
  loadingConversations: boolean;
  loadingMessages: boolean;

  setConversations: (conversations: ChatConversation[]) => void;
  setActiveConversationId: (id: string | null) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;

  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<ChatMessage | null>;
  createConversation: (participantIds: string[], title?: string) => Promise<ChatConversation | null>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  loadingConversations: false,
  loadingMessages: false,

  setConversations: (conversations) => set({ conversations }),

  setActiveConversationId: (id) => {
    set({ activeConversationId: id });
    if (id && !get().messages[id]) {
      get().fetchMessages(id);
    }
  },

  setMessages: (conversationId, conversationMessages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: conversationMessages,
      },
    })),

  addMessage: (conversationId, message) => {
    set((state) => {
      const currentMessages = state.messages[conversationId] || [];
      // Prevent duplicates
      if (currentMessages.some((m) => m.id === message.id)) {
        return state;
      }
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...currentMessages, message],
        },
      };
    });

    // Update conversation updatedAt and last message locally to trigger list sort
    set((state) => {
      const updatedConversations = state.conversations.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            updatedAt: new Date().toISOString(),
            messages: [message], // Store as latest message in the preview
          };
        }
        return c;
      });

      // Sort by updatedAt descending
      const sorted = [...updatedConversations].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      return { conversations: sorted };
    });
  },

  fetchConversations: async () => {
    set({ loadingConversations: true });
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        set({ conversations: data });
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      set({ loadingConversations: false });
    }
  },

  fetchMessages: async (conversationId) => {
    set({ loadingMessages: true });
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      if (response.ok) {
        const data = await response.json();
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: data,
          },
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch messages for ${conversationId}:`, error);
    } finally {
      set({ loadingMessages: false });
    }
  },

  sendMessage: async (conversationId, content) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        get().addMessage(conversationId, newMessage);
        return newMessage;
      }
      return null;
    } catch (error) {
      console.error(`Failed to send message:`, error);
      return null;
    }
  },

  createConversation: async (participantIds, title) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantIds, title }),
      });

      if (response.ok) {
        const newConversation = await response.json();

        // Update list
        set((state) => {
          const exists = state.conversations.some((c) => c.id === newConversation.id);
          const updated = exists
            ? state.conversations.map((c) => (c.id === newConversation.id ? newConversation : c))
            : [newConversation, ...state.conversations];

          const sorted = [...updated].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );

          return {
            conversations: sorted,
            activeConversationId: newConversation.id,
          };
        });

        // Fetch messages for new conversation
        get().fetchMessages(newConversation.id);

        return newConversation;
      }
      return null;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  },
}));
