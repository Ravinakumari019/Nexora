'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bot, Sparkles, Send, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

const PRESET_SUGGESTIONS = [
  {
    title: 'Explain React 19 Server Actions',
    desc: 'Get an overview of form integration and server-side execution.',
    prompt: 'Explain React 19 Server Actions, details, benefits, and give an example code snippet.',
  },
  {
    title: 'Draft a professional follow-up',
    desc: 'Generate a friendly reminder email for a project sync.',
    prompt: 'Help me draft a friendly and professional follow-up email to my team for our weekly project sync.',
  },
  {
    title: 'How to summarize chats?',
    desc: 'Learn how to use the conversation summarizer feature.',
    prompt: 'How do I use the Nexora chat summarizer feature?',
  },
  {
    title: 'Explain Turbopack vs Webpack',
    desc: 'Understand the speed difference in Next.js builds.',
    prompt: 'What is Next.js Turbopack and how does it compare to Webpack in performance?',
  },
];

export default function AiAssistantPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || inputVal).trim();
    if (!promptToSend || isLoading) return;

    if (!customPrompt) {
      setInputVal('');
    }

    const userMsgId = crypto.randomUUID();
    const newUserMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: promptToSend,
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Prepare history to match the API expectation
      const requestHistory = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: requestHistory }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      
      if (data.isSimulated) {
        setIsSimulated(true);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'model',
          content: data.response,
        },
      ]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate response. Check your connection or API key.');
      // Remove the last message from UI on error to let user retry
      setMessages((prev) => prev.filter((m) => m.id !== userMsgId));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setIsSimulated(false);
  };

  // Basic Markdown-like formatter for code blocks, lists, and headers in AI response
  const formatAiMessage = (text: string) => {
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeContent: string[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      // Code blocks handler
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          elements.push(
            <pre key={`code-${index}`} className="bg-neutral-900 text-neutral-100 p-4 rounded-xl overflow-x-auto text-xs font-mono my-3 border border-neutral-800 shadow-md">
              <code>{codeContent.join('\n')}</code>
            </pre>
          );
          codeContent = [];
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      // Headers handler
      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={`h4-${index}`} className="text-base font-bold text-foreground mt-4 mb-2 tracking-tight">
            {line.substring(4)}
          </h4>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h3 key={`h3-${index}`} className="text-lg font-bold text-foreground mt-4 mb-2 tracking-tight">
            {line.substring(3)}
          </h3>
        );
        return;
      }
      if (line.startsWith('# ')) {
        elements.push(
          <h2 key={`h2-${index}`} className="text-xl font-bold text-foreground mt-4 mb-2 tracking-tight">
            {line.substring(2)}
          </h2>
        );
        return;
      }

      // Bullet points
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        elements.push(
          <li key={`li-${index}`} className="ml-5 list-disc text-sm leading-relaxed text-muted-foreground my-1">
            {line.trim().substring(2)}
          </li>
        );
        return;
      }

      // Inline code fallback (`code`)
      const inlineCodeRegex = /`([^`]+)`/g;
      const parts = [];
      let lastIdx = 0;
      let match;

      while ((match = inlineCodeRegex.exec(line)) !== null) {
        if (match.index > lastIdx) {
          parts.push(line.substring(lastIdx, match.index));
        }
        parts.push(
          <code key={`inline-${match.index}`} className="bg-muted text-primary font-mono text-xs px-1.5 py-0.5 rounded border border-border">
            {match[1]}
          </code>
        );
        lastIdx = inlineCodeRegex.lastIndex;
      }
      if (lastIdx < line.length) {
        parts.push(line.substring(lastIdx));
      }

      if (line.trim() === '') {
        elements.push(<div key={`empty-${index}`} className="h-2" />);
      } else {
        elements.push(
          <p key={`p-${index}`} className="text-sm leading-relaxed my-1.5">
            {parts.length > 0 ? parts : line}
          </p>
        );
      }
    });

    return elements;
  };

  const userInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex h-full w-full flex-col bg-background/30 overflow-hidden">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border bg-background/50 px-6 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
            <Bot size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">Nexora AI Companion</span>
            <span className="text-[10px] text-muted-foreground">Google Gemini 1.5 Flash</span>
          </div>
        </div>

        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat} className="text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-xl h-8">
            <RefreshCw size={12} />
            Reset Chat
          </Button>
        )}
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Simulation Mode Banner */}
        {isSimulated && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl p-4 flex gap-3 items-start max-w-3xl mx-auto shadow-sm shadow-amber-500/2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Simulation Mode Active</p>
              <p className="leading-relaxed opacity-90">
                Google Gemini is running in simulation mode because no <code className="font-mono bg-amber-500/10 px-1 py-0.5 rounded text-[10px]">GOOGLE_GEMINI_API_KEY</code> has been configured in your local environment.
              </p>
              <p className="font-medium mt-1">
                To activate real responses, add your API key to your <code className="font-mono bg-amber-500/10 px-1 py-0.5 rounded text-[10px]">.env.local</code> file and restart the server.
              </p>
            </div>
          </div>
        )}

        {/* Conversation list */}
        {messages.length === 0 ? (
          /* Blank state / suggested prompts */
          <div className="max-w-3xl mx-auto space-y-8 py-8">
            <div className="text-center space-y-3">
              <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-2xl mx-auto shadow-lg shadow-primary/5 border border-primary/15">
                <Sparkles size={28} className="animate-pulse" />
              </div>
              <h2 className="font-heading text-2xl font-bold tracking-tight">Ask Nexora AI anything</h2>
              <p className="text-muted-foreground text-sm max-w-[450px] mx-auto leading-relaxed">
                Unlock writing assistance, technical guidance, code refactoring, and conversation highlights from Gemini.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              {PRESET_SUGGESTIONS.map((preset) => (
                <Card
                  key={preset.title}
                  onClick={() => handleSend(preset.prompt)}
                  className="border-border/50 bg-background/50 backdrop-blur-sm cursor-pointer hover:border-primary/20 hover:bg-primary/5 hover:shadow-md transition-all duration-300 rounded-2xl text-left"
                >
                  <CardContent className="p-4 space-y-1">
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">{preset.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{preset.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Bubble rendering */
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => {
              const isSelf = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex gap-3 ${isSelf ? 'ml-auto flex-row-reverse max-w-[85%]' : 'mr-auto max-w-[90%]'}`}>
                  {/* Avatar */}
                  <Avatar className="h-8 w-8 border border-border shrink-0 mt-1">
                    {isSelf ? (
                      <>
                        {session?.user?.image ? (
                          <AvatarImage src={session.user.image} alt={session.user.name || 'User'} referrerPolicy="no-referrer" />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                          {userInitial}
                        </AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                        <Bot size={14} />
                      </AvatarFallback>
                    )}
                  </Avatar>

                  {/* Message Bubble */}
                  <div className="space-y-1">
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm shadow-sm break-words select-text ${
                        isSelf
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-card border border-border rounded-tl-none text-card-foreground font-normal'
                      }`}
                    >
                      {isSelf ? <p className="whitespace-pre-wrap">{msg.content}</p> : formatAiMessage(msg.content)}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 mr-auto max-w-[90%]">
                <Avatar className="h-8 w-8 border border-border shrink-0 mt-1">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                    <Bot size={14} />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-card border border-border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center justify-center gap-1.5 h-10 w-16">
                  <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce duration-300" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce duration-300" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-primary animate-bounce duration-300" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="border-t border-border p-4 bg-background/50 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-3xl mx-auto flex gap-2 bg-background border border-border rounded-2xl p-2.5 shadow-sm"
        >
          <Input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isLoading}
            placeholder="Ask AI anything..."
            className="flex-1 bg-transparent border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-10"
          />
          <Button
            type="submit"
            disabled={isLoading || inputVal.trim() === ''}
            className="h-10 px-4 rounded-xl shadow-md shadow-primary/10 shrink-0"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={15} />}
          </Button>
        </form>
      </div>
    </div>
  );
}
