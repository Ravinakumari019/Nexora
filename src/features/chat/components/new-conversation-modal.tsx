/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Check, UserPlus } from 'lucide-react';
import { useChatStore } from '@/store/use-chat-store';
import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export function NewConversationModal({ isOpen, onClose }: NewConversationModalProps) {
  const { createConversation } = useChatStore();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupTitle, setGroupTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setFetching(true);
        try {
          const res = await fetch('/api/users');
          if (res.ok) {
            const data = await res.json();
            setUsers(data);
          } else {
            toast.error('Failed to load users');
          }
        } catch (error) {
          console.error(error);
          toast.error('Something went wrong loading users');
        } finally {
          setFetching(false);
        }
      };

      fetchUsers();
      // Reset state
      setSelectedUserIds([]);
      setGroupTitle('');
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredUsers = users.filter((user) => {
    const term = searchQuery.toLowerCase();
    const nameMatch = user.name?.toLowerCase().includes(term);
    const emailMatch = user.email.toLowerCase().includes(term);
    return nameMatch || emailMatch;
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (selectedUserIds.length === 0) {
      toast.error('Select at least one participant');
      return;
    }

    setLoading(true);
    try {
      const isGroup = selectedUserIds.length > 1;
      const title = isGroup ? groupTitle.trim() || undefined : undefined;

      const conversation = await createConversation(selectedUserIds, title);
      if (conversation) {
        toast.success(isGroup ? 'Group created!' : 'Conversation started!');
        onClose();
      } else {
        toast.error('Failed to create conversation');
      }
    } catch (error) {
      console.error(error);
      toast.error('Internal server error');
    } finally {
      setLoading(false);
    }
  };

  const selectedUsers = users.filter((u) => selectedUserIds.includes(u.id));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedUserIds.length > 1 ? 'New Group Chat' : 'New Conversation'}
      description="Select users to start chatting."
      className="max-h-[85vh] overflow-hidden flex flex-col sm:max-w-md"
      footer={
        <div className="flex w-full justify-between items-center gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading || selectedUserIds.length === 0}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <UserPlus size={16} />
                Create
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-1">
        {/* Selected chips */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-2 border-b border-border">
            {selectedUsers.map((u) => (
              <Badge key={u.id} variant="secondary" className="flex items-center gap-1 py-1 pr-1.5 pl-2">
                <span>{u.name || u.email}</span>
                <button
                  type="button"
                  onClick={() => toggleUserSelection(u.id)}
                  className="rounded-full text-muted-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 p-0.5"
                >
                  &times;
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Group title field */}
        {selectedUserIds.length > 1 && (
          <div className="space-y-1.5 animate-fadeIn duration-200">
            <label className="text-xs font-semibold text-muted-foreground">Group Title (Optional)</label>
            <Input
              placeholder="e.g. Development Team, Marketing Group"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
            />
          </div>
        )}

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* User list */}
        <div className="space-y-1 overflow-y-auto max-h-[30vh]">
          {fetching ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground text-sm gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Fetching users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No users found
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedUserIds.includes(user.id);
              const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

              return (
                <button
                  key={user.id}
                  onClick={() => toggleUserSelection(user.id)}
                  className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-accent text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      {user.image && <AvatarImage src={user.image} alt={user.name || 'User'} referrerPolicy="no-referrer" />}
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold truncate">
                        {user.name || 'Anonymous User'}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
