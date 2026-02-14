import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Share2, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareCardProps {
  slug: string;
  displayName: string;
}

export function ShareCard({ slug, displayName }: ShareCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/to/${slug}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Now go send it to your crush! 💌",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Please copy the link manually.",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="paper-card p-8 rounded-2xl border border-rose-200 bg-[#EDE5D8] relative overflow-hidden"
    >
      {/* Decorative fold */}
      <div className="absolute top-0 right-0 w-12 h-12 bg-[#F7F2E9] shadow-sm -mr-6 -mt-6 rotate-45 border-b border-l border-stone-300/30" />
      
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mb-2">
          <Heart className="w-8 h-8 text-rose-600 fill-rose-600/10" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-display text-ink">It's ready, {displayName}!</h2>
          <p className="font-body text-ink-light text-lg">
            Your unique Valentine link is active.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-[#FDFAF5] border border-stone-200 rounded-lg flex items-center justify-between gap-3 group">
            <code className="text-sm font-mono text-rose-900 truncate flex-1">
              {shareUrl}
            </code>
            <Button
              size="icon"
              variant="ghost"
              onClick={copyToClipboard}
              className="shrink-0 hover:bg-rose-50"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-stone-400" />
              )}
            </Button>
          </div>

          <Button
            onClick={copyToClipboard}
            className="w-full h-14 wax-seal flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Copy & Share Link
          </Button>
        </div>

        <div className="pt-6 border-t border-stone-200/50 space-y-4 text-left">
          <p className="text-xs font-ui font-bold uppercase tracking-widest text-stone-400">
            Next Steps:
          </p>
          <ul className="space-y-3 font-body text-ink-light text-sm">
            <li className="flex gap-2">
              <span className="text-rose-500 font-bold">1.</span>
              Copy the unique link above.
            </li>
            <li className="flex gap-2">
              <span className="text-rose-500 font-bold">2.</span>
              Send it to your crush via DM, story, or bio.
            </li>
            <li className="flex gap-2">
              <span className="text-rose-500 font-bold">3.</span>
              Wait for them to open it and share their heart.
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
