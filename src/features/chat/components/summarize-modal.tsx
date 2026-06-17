'use client';

import { useState, useEffect } from 'react';
import { Loader2, Copy, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SummarizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string | null;
  conversationTitle: string | null;
}

export function SummarizeModal({ isOpen, onClose, conversationId, conversationTitle }: SummarizeModalProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSimulated, setIsSimulated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && conversationId) {
      const fetchSummary = async () => {
        setLoading(true);
        setSummary('');
        setIsSimulated(false);
        setCopied(false);

        try {
          const res = await fetch('/api/ai/summarize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ conversationId }),
          });

          if (res.ok) {
            const data = await res.json();
            setSummary(data.summary);
            setIsSimulated(!!data.isSimulated);
          } else {
            toast.error('Failed to generate summary');
            onClose();
          }
        } catch (error) {
          console.error(error);
          toast.error('Something went wrong generating the summary');
          onClose();
        } finally {
          setLoading(false);
        }
      };

      fetchSummary();
    }
  }, [isOpen, conversationId, onClose]);

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast.success('Summary copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error('Failed to copy text');
    }
  };

  // Convert bullet point plain text to JSX list
  const renderSummaryText = (text: string) => {
    const lines = text.split('\n');
    return (
      <ul className="space-y-2.5">
        {lines.map((line, index) => {
          const cleanLine = line.trim();
          if (!cleanLine) return null;

          // Check if bullet point formatting (starts with * or -)
          if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
            // Check for bold parts within the bullet e.g. **Bold**: text
            const content = cleanLine.substring(2);
            const boldRegex = /\*\*([^*]+)\*\*/g;
            const parts = [];
            let lastIdx = 0;
            let match;

            while ((match = boldRegex.exec(content)) !== null) {
              if (match.index > lastIdx) {
                parts.push(content.substring(lastIdx, match.index));
              }
              parts.push(
                <strong key={`bold-${match.index}`} className="text-foreground font-semibold">
                  {match[1]}
                </strong>
              );
              lastIdx = boldRegex.lastIndex;
            }
            if (lastIdx < content.length) {
              parts.push(content.substring(lastIdx));
            }

            return (
              <li key={index} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <span className="text-primary mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 bg-primary" />
                <span>{parts.length > 0 ? parts : content}</span>
              </li>
            );
          }

          return (
            <p key={index} className="text-sm leading-relaxed text-muted-foreground">
              {cleanLine}
            </p>
          );
        })}
      </ul>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Conversation Summary"
      description={conversationTitle ? `AI-generated highlight of "${conversationTitle}"` : 'AI-generated highlight of this chat'}
      className="max-h-[85vh] overflow-hidden flex flex-col sm:max-w-lg"
      footer={
        <div className="flex w-full justify-between items-center gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>
          <Button onClick={handleCopy} disabled={loading || !summary} className="gap-1.5 rounded-xl shadow-md shadow-primary/10">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy Summary'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-1 py-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
            <div className="relative flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <Sparkles className="h-4 w-4 text-primary absolute animate-pulse" />
            </div>
            <p className="text-sm font-medium animate-pulse text-foreground/80">Gemini is analyzing the conversation...</p>
            <p className="text-xs text-muted-foreground max-w-[250px] text-center">
              Reading messages history and extracting key points.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Simulation Warning Banner inside Modal */}
            {isSimulated && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl p-3 flex gap-2.5 items-start">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold">Simulation Mode:</span> This summary is simulated because no API key was configured. Add <code className="font-mono bg-amber-500/10 px-1 py-0.2 rounded text-[10px]">GOOGLE_GEMINI_API_KEY</code> in <code className="font-mono bg-amber-500/10 px-1 py-0.2 rounded text-[10px]">.env.local</code> to activate live Gemini summaries.
                </div>
              </div>
            )}

            {/* Rendered bullets */}
            <div className="bg-accent/40 border border-border/40 rounded-2xl p-5 shadow-inner">
              {summary ? renderSummaryText(summary) : <p className="text-sm text-center text-muted-foreground italic">No summary generated.</p>}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
