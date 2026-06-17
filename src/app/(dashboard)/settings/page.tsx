/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Bell, Shield, Palette, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { toast } from 'sonner';

type SettingsTab = 'Profile' | 'Notifications' | 'Appearance' | 'Privacy & Security';

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const user = session?.user;

  const [activeTab, setActiveTab] = useState<SettingsTab>('Profile');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize fields once session loads
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setStatus(user.status || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;

    setSaving(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          status: status.trim() || null,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Update local session
        await updateSession({
          name: updatedUser.name,
          status: updatedUser.status,
        });

        toast.success('Profile updated successfully!');
      } else {
        const errorText = await response.text();
        toast.error(errorText || 'Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while saving profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const [desktopNotify, setDesktopNotify] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  return (
    <div className="flex h-full w-full flex-col p-6 overflow-y-auto">
      <div className="mx-auto max-w-4xl w-full space-y-6">
        <div>
          <h2 className="font-heading text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground text-sm">
            Manage your account settings, workspace theme, and alert notifications.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Settings Navigation Tabs */}
          <div className="flex flex-col gap-1">
            {[
              { label: 'Profile', icon: User },
              { label: 'Notifications', icon: Bell },
              { label: 'Appearance', icon: Palette },
              { label: 'Privacy & Security', icon: Shield },
            ].map((tab) => {
              const isActive = activeTab === tab.label;
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setActiveTab(tab.label as SettingsTab)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 border border-transparent ${
                    isActive
                      ? 'bg-primary/10 text-primary border-primary/5 shadow-sm shadow-primary/2'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Settings Content Pane */}
          <div className="md:col-span-2 space-y-6">
            {activeTab === 'Profile' && (
              <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
                  <CardDescription>Update your public details visible in conversations.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                      <Input
                        value={user?.email || ''}
                        disabled
                        className="bg-muted/50 border-border cursor-not-allowed text-muted-foreground"
                      />
                      <p className="text-[10px] text-muted-foreground/80 pl-1">
                        Email address cannot be changed as it is connected to your auth provider.
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="displayName" className="text-xs font-semibold text-muted-foreground">Display Name</label>
                      <Input
                        id="displayName"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-background border-border"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="statusMsg" className="text-xs font-semibold text-muted-foreground">Status Message</label>
                      <Input
                        id="statusMsg"
                        placeholder="What's on your mind?"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-background border-border"
                      />
                    </div>

                    <Button type="submit" disabled={saving || !name.trim()} className="gap-1.5 rounded-xl shadow-md shadow-primary/10 w-fit">
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'Notifications' && (
              <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Manage sound effects and alert banners inside the app.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border/50">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Desktop Notifications</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">Show notifications in system tray for new chat messages.</p>
                    </div>
                    <Button
                      variant={desktopNotify ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDesktopNotify(!desktopNotify)}
                      className="rounded-xl h-9"
                    >
                      {desktopNotify ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Sound Effects</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">Play notification sound chimes on incoming text messages.</p>
                    </div>
                    <Button
                      variant={soundEffects ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSoundEffects(!soundEffects)}
                      className="rounded-xl h-9"
                    >
                      {soundEffects ? 'On' : 'Off'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'Appearance' && (
              <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle>Appearance settings</CardTitle>
                  <CardDescription>Customize the visual style and coloring theme for Nexora.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-foreground">Interface Theme</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Select light mode, dark mode, or follow your computer system settings dynamically.
                    </p>
                    <div className="pt-2 flex">
                      <ThemeToggle />
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4 flex flex-col gap-2">
                    <p className="text-sm font-semibold text-foreground">Accent Color</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Nexora uses the custom warm color palette (amber/primary highlights) for a modern, glassmorphic layout.
                    </p>
                    <div className="flex gap-2 pt-2">
                      <span className="h-6 w-6 rounded-full bg-primary ring-2 ring-primary/20 cursor-pointer" />
                      <span className="h-6 w-6 rounded-full bg-blue-500 opacity-40 cursor-not-allowed" />
                      <span className="h-6 w-6 rounded-full bg-emerald-500 opacity-40 cursor-not-allowed" />
                      <span className="h-6 w-6 rounded-full bg-rose-500 opacity-40 cursor-not-allowed" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'Privacy & Security' && (
              <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle>Privacy & account safety</CardTitle>
                  <CardDescription>Configure credential options and manage session authorization.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border/50">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Active Sessions</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">You have 1 active connection on this browser tab.</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl h-9">Manage Sessions</Button>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-destructive">Delete Account</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">Permanently delete your user profile and conversation histories.</p>
                    </div>
                    <Button variant="destructive" size="sm" className="rounded-xl h-9">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
