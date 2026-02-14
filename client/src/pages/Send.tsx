import { useState } from "react";
import { useRoute } from "wouter";
import { useCreator } from "@/hooks/use-creators";
import { useSendMessage } from "@/hooks/use-messages";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send as SendIcon } from "lucide-react";
import { VibeCard } from "@/components/VibeCard";
import { FlowerCard } from "@/components/FlowerCard";
import { FloatingHearts } from "@/components/FloatingHearts";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

import bouquet01 from "@assets/64603-OB2R9V-578_1771092125803.jpg";
import bouquet02 from "@assets/6502939_1771092125804.jpg";
import bouquet03 from "@assets/6523075_1771092125804.jpg";
import bouquet04 from "@assets/6463769_1771092135717.jpg";
import bouquet05 from "@assets/6517084_1771092142814.jpg";
import bouquet06 from "@assets/6518416_1771092148926.jpg";

// Mock data for flowers - using provided assets
const FLOWERS = [
  { id: "bouquet-01", name: "Red Roses", image: bouquet01 },
  { id: "bouquet-02", name: "Pink Heart", image: bouquet02 },
  { id: "bouquet-03", name: "Heart & Bow", image: bouquet03 },
  { id: "bouquet-04", name: "Vintage Blooms", image: bouquet04 },
  { id: "bouquet-05", name: "Vibrant Coral", image: bouquet05 },
  { id: "bouquet-06", name: "Yellow Tulips", image: bouquet06 },
];

const VIBES = [
  { id: "coffee", label: "Coffee Date" },
  { id: "dinner", label: "Dinner" },
  { id: "talk", label: "Just Talk" },
  { id: "adventure", label: "Adventure" },
  { id: "romance", label: "Romance" },
  { id: "friends", label: "Friendship" },
];

export default function Send() {
  const [match, params] = useRoute("/to/:slug");
  const slug = match ? params.slug : null;
  const { data: creator, isLoading: loadingCreator } = useCreator(slug);
  const sendMessage = useSendMessage();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'confession' | 'bouquet'>('confession');
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [selectedBouquet, setSelectedBouquet] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [note, setNote] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!creator) return;

    if (activeTab === 'confession' && !content) {
      toast({ variant: "destructive", title: "Wait!", description: "Please write a message first." });
      return;
    }
    if (activeTab === 'bouquet' && !selectedBouquet) {
      toast({ variant: "destructive", title: "Wait!", description: "Please select a bouquet." });
      return;
    }

    try {
      await sendMessage.mutateAsync({
        creatorId: creator.id,
        type: activeTab,
        vibe: activeTab === 'confession' ? selectedVibe : null,
        content: activeTab === 'confession' ? content : null,
        bouquetId: activeTab === 'bouquet' ? selectedBouquet : null,
        note: activeTab === 'bouquet' ? note : null,
        senderDevice: navigator.userAgent,
        senderLocation: "Unknown", // In a real app we'd ask for permission or use IP geo
      });

      setIsSuccess(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C8445A', '#E8A0A8', '#F7F2E9']
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send",
      });
    }
  };

  if (loadingCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-8 h-8 animate-spin text-ink/30" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper p-4 text-center">
        <h1 className="text-4xl font-display mb-4">User not found</h1>
        <p className="font-body text-ink-light">Maybe the link is incorrect?</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full paper-card p-12 rounded-2xl border border-stone-200"
        >
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <SendIcon className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-4xl font-display mb-4">Sent with love</h2>
          <p className="font-body text-ink-light mb-8">
            Your message has been delivered to {creator.displayName}.
          </p>
          <button
            onClick={() => {
              setIsSuccess(false);
              setContent("");
              setNote("");
              setSelectedVibe(null);
              setSelectedBouquet(null);
            }}
            className="text-sm font-ui uppercase tracking-widest border-b border-stone-300 pb-1 hover:border-rose-500 hover:text-rose-600 transition-colors"
          >
            Send another
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper pb-20 relative overflow-hidden">
      <FloatingHearts />
      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center border-b border-stone-200/50">
        <span className="block text-xs font-ui font-bold uppercase tracking-widest text-stone-400 mb-2">
          Writing to
        </span>
        <h1 className="text-5xl md:text-6xl font-display text-ink">{creator.displayName}</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8">
        {/* Tabs */}
        <div className="flex justify-center gap-8 mb-12 relative">
          <button
            onClick={() => setActiveTab('confession')}
            className={cn(
              "pb-4 text-lg font-display transition-colors relative",
              activeTab === 'confession' ? "text-rose-900" : "text-stone-400 hover:text-stone-600"
            )}
          >
            Confession
            {activeTab === 'confession' && (
              <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('bouquet')}
            className={cn(
              "pb-4 text-lg font-display transition-colors relative",
              activeTab === 'bouquet' ? "text-rose-900" : "text-stone-400 hover:text-stone-600"
            )}
          >
            Send Flowers
            {activeTab === 'bouquet' && (
              <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'confession' ? (
            <motion.div
              key="confession"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div>
                <label className="block text-xs font-ui font-bold uppercase tracking-widest text-stone-400 mb-4 ml-1">
                  What's the vibe? (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {VIBES.map((vibe) => (
                    <VibeCard
                      key={vibe.id}
                      vibe={vibe.id}
                      label={vibe.label}
                      selected={selectedVibe === vibe.id}
                      onClick={() => setSelectedVibe(vibe.id === selectedVibe ? null : vibe.id)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-ui font-bold uppercase tracking-widest text-stone-400 mb-2 ml-1">
                  Your Message
                </label>
                <div className="relative">
                  <div className="absolute top-0 left-8 bottom-0 w-px bg-red-200/50 pointer-events-none" />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write something honest..."
                    className="w-full min-h-[200px] lined-paper p-8 pl-12 font-body text-xl text-ink leading-8 outline-none border border-stone-200 rounded-lg focus:border-rose-300 transition-colors resize-y"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="bouquet"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {FLOWERS.map((flower) => (
                  <FlowerCard
                    key={flower.id}
                    {...flower}
                    selected={selectedBouquet === flower.id}
                    onClick={() => setSelectedBouquet(flower.id)}
                  />
                ))}
              </div>

              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <label className="block text-xs font-ui font-bold uppercase tracking-widest text-stone-400 mb-3">
                  Attach a note
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Just for you..."
                  className="w-full bg-transparent border-b border-stone-200 focus:border-rose-400 outline-none py-2 font-body text-lg"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 mb-20">
          <button
            onClick={handleSubmit}
            disabled={sendMessage.isPending}
            className="w-full h-16 wax-seal text-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "Seal & Send"
            )}
          </button>
          <p className="text-center mt-4 text-xs font-ui text-stone-400">
            Messages are private and only visible to {creator.displayName}.
          </p>
        </div>
      </main>
    </div>
  );
}
