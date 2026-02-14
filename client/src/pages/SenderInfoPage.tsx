import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertConfessionSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "wouter";
import { FloatingHearts } from "@/components/FloatingHearts";
import { Sparkles } from "@/components/Sparkles";

const INTENT_OPTIONS = [
    { emoji: "☕", text: "A cup of coffee together", desc: "Let's chat over lattes" },
    { emoji: "🌟", text: "Getting to know you", desc: "I'd love to learn more about you" },
    { emoji: "🌹", text: "A romantic dinner date", desc: "Dinner for two, just us" },
    { emoji: "💫", text: "Just spend time together", desc: "Anywhere, anytime, with you" },
    { emoji: "🎬", text: "Watching a movie together", desc: "Netflix and... you know 😉" },
    { emoji: "🎮", text: "Playing games together", desc: "Let's have some fun!" },
    { emoji: "🌳", text: "A walk in the park", desc: "Nature and good company" },
];

const senderInfoSchema = insertConfessionSchema.pick({ senderName: true, intentOption: true });
type SenderInfo = z.infer<typeof senderInfoSchema>;

export default function SenderInfoPage() {
    const [, setLocation] = useLocation();
    const [selectedIntent, setSelectedIntent] = useState<string>("");

    const form = useForm<SenderInfo>({
        resolver: zodResolver(senderInfoSchema),
        defaultValues: {
            senderName: "",
            intentOption: "",
        },
    });

    const onSubmit = (data: SenderInfo) => {
        sessionStorage.setItem("senderInfo", JSON.stringify(data));
        setLocation("/compose");
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <FloatingHearts />
            <Sparkles />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 relative z-10"
            >
                <header className="text-center space-y-4">
                    <motion.h1
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl md:text-7xl font-bold gradient-text mb-4 font-heading"
                        style={{
                            textShadow: "0 2px 10px rgba(255, 107, 157, 0.3)",
                            animation: "pulse 2s ease-in-out infinite",
                        }}
                    >
                        💕 Share Your Heart 💕
                    </motion.h1>

                    <motion.p
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-xl text-gray-600 italic max-w-xl mx-auto font-friendly"
                    >
                        Every love story starts with a brave first step...
                    </motion.p>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="w-full max-w-md mx-auto"
                >
                    <div className="glass-card rounded-3xl p-8 border-2 border-pink-100 shadow-xl">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="senderName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-semibold text-deep-romantic flex items-center gap-2 font-heading">
                                                Your Name (just for us 🤫)
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Your real name here..."
                                                        className="bg-white border-2 border-transparent rounded-[20px] px-5 py-6 text-base shadow-[0_4px_15px_rgba(255,107,157,0.1)] transition-all duration-300 focus:border-[#FF6B9D] focus:shadow-[0_4px_20px_rgba(255,107,157,0.3)] focus:outline-none focus-visible:ring-0 font-body"
                                                        {...field}
                                                    />
                                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
                                                </div>
                                            </FormControl>
                                            <p className="text-xs text-gray-500 mt-1 italic">
                                                🔒 Your name is kept private for our records only
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <FormLabel className="text-lg font-semibold text-deep-romantic font-heading">
                                        What's your vibe? 💭
                                    </FormLabel>
                                    <FormField
                                        control={form.control}
                                        name="intentOption"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="space-y-3">
                                                        {INTENT_OPTIONS.map((option) => (
                                                            <button
                                                                key={option.text}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedIntent(option.text);
                                                                    field.onChange(option.text);
                                                                }}
                                                                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${selectedIntent === option.text
                                                                        ? "bg-gradient-to-br from-[#FFF0F5] to-[#FFE5EC] border-[#FF6B9D] shadow-[0_8px_25px_rgba(255,107,157,0.3)]"
                                                                        : "bg-white/80 border-transparent shadow-sm hover:border-[#FFC2E2] hover:shadow-md hover:-translate-y-1"
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-3xl">{option.emoji}</span>
                                                                    <div className="flex-1">
                                                                        <div className="text-lg font-semibold text-gray-800 font-body">
                                                                            {option.text}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500 mt-1 font-friendly">
                                                                            {option.desc}
                                                                        </div>
                                                                    </div>
                                                                    {selectedIntent === option.text && (
                                                                        <Heart className="text-[#FF6B9D] fill-[#FF6B9D]" size={24} />
                                                                    )}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        type="submit"
                                        disabled={!selectedIntent || !form.watch("senderName")}
                                        className="w-full h-14 text-lg font-semibold rounded-[50px] bg-gradient-to-r from-[#FF6B9D] to-[#C73866] text-white border-none shadow-[0_8px_20px_rgba(255,107,157,0.4)] hover:shadow-[0_12px_30px_rgba(255,107,157,0.5)] transition-all relative overflow-hidden font-heading"
                                    >
                                        Next
                                        <ArrowRight className="ml-2 h-5 w-5 inline-block" />
                                    </Button>
                                </motion.div>
                            </form>
                        </Form>
                    </div>
                </motion.div>

                <div className="mt-4 flex flex-col items-center gap-1 text-xs text-gray-500">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="italic text-center"
                    >
                        Your identity stays secret 🎭
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
}
