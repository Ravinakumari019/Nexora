'use client';

import { useSession, signOut } from 'next-auth/react';
import { User, Mail, Calendar, LogOut } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function ProfilePlaceholder() {
  const { data: session } = useSession();
  const user = session?.user;
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex h-full w-full flex-col p-6 overflow-y-auto">
      <div className="mx-auto max-w-2xl w-full space-y-6">
        <div>
          <h2 className="font-heading text-3xl font-bold tracking-tight">Your Profile</h2>
          <p className="text-muted-foreground text-sm">
            View your personal profile details and account status.
          </p>
        </div>

        <Card className="overflow-hidden">
          {/* Header Banner */}
          <div className="h-32 w-full bg-gradient-to-r from-primary/30 via-orange-500/20 to-amber-500/10" />

          <CardContent className="relative px-6 pb-6 pt-0">
            {/* Avatar positioning */}
            <div className="absolute -top-12 left-6">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                {user?.image ? (
                  <AvatarImage src={user.image} alt={user.name || 'User'} referrerPolicy="no-referrer" />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {initial}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Info */}
            <div className="pt-16 space-y-4">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">{user?.name || 'Nexora User'}</h3>
                <p className="text-sm text-muted-foreground">Nexora Member</p>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <User size={16} className="text-primary" />
                  <span>ID: <code className="bg-muted font-mono px-1.5 py-0.5 rounded text-xs">{user?.id || 'loading...'}</code></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail size={16} className="text-primary" />
                  <span>Email: {user?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Calendar size={16} className="text-primary" />
                  <span>Joined Nexora: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  variant="destructive"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
