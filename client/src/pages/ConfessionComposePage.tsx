import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertConfessionSchema, type InsertConfession } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ArrowLeft, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FloatingHearts } from "@/components/FloatingHearts";
import { Sparkles as SparklesComponent } from "@/components/Sparkles";
import confetti from "canvas-confetti";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const SUBMIT_BUTTONS = [
    "🙈 Oopsy, I confessed!",
    "💕 My secret has been spilled!",
    "💌 Send my confession!",
    "🎭 Reveal my heart (anonymously!)",
];

// Schema for just the message part
const composeSchema = z.object({
    message: z.string().min(10, "Message is too short").max(1000, "Message is too long"),
});
type ComposeData = z.infer<typeof composeSchema>;

export default function ConfessionComposePage() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [createdId, setCreatedId] = useState<string | null>(null);
    const [senderInfo, setSenderInfo] = useState<{ senderName: string; intentOption: string } | null>(null);
    const [submitButtonText, setSubmitButtonText] = useState(SUBMIT_BUTTONS[0]);

    useEffect(() => {
        const stored = sessionStorage.getItem("senderInfo");
        if (!stored) {
            setLocation("/");
            return;
        }
        setSenderInfo(JSON.parse(stored));
        setSubmitButtonText(SUBMIT_BUTTONS[Math.floor(Math.random() * SUBMIT_BUTTONS.length)]);
    }, [setLocation]);

    const form = useForm<ComposeData>({
        resolver: zodResolver(composeSchema),
        defaultValues: {
            message: "",
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: InsertConfession) => {
            const res = await apiRequest("POST", "/api/confessions", data);
            return res.json();
        },
        onSuccess: (confession) => {
            setCreatedId(confession.id);
            sessionStorage.removeItem("senderInfo"); // Clear session
            toast({
                title: "Confession Sent! 💌",
                description: "Your secret is on its way to their heart ✨",
            });
            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FF6B9D', '#FFC2E2', '#FFD700', '#E6B8E8']
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Oops! 💔",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const onSubmit = async (data: ComposeData) => {
        if (!senderInfo) return;
        createMutation.mutate({
            senderName: senderInfo.senderName,
            intentOption: senderInfo.intentOption,
            message: data.message,
        });
    };

    const copyLink = () => {
        if (!createdId) return;
        const link = `${window.location.origin}/v/${createdId}`;
        navigator.clipboard.writeText(link);
        toast({
            title: "Copied! 🔗",
            description: "Send it to your crush ASAP!",
        });
    };

    const messageLength = form.watch("message")?.length || 0;

    if (!senderInfo) return null;

    return (
        <>
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <FloatingHearts />
                <SparklesComponent />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-2xl mx-auto relative z-10"
                >
                    <Button
                        variant="ghost"
                        onClick={() => setLocation("/")}
                        className="mb-4 text-gray-600 hover:text-foreground hover:bg-white/50"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    <div className="glass-card rounded-3xl p-8 border-2 border-pink-100 shadow-xl">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-center mb-8"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-2 font-heading">
                                💌 Time to Confess 💌
                            </h2>
                            <p className="text-lg text-gray-600 italic mt-2 font-friendly">
                                Pour your heart out... they'll never know it's you 💭
                            </p>
                        </motion.div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-semibold text-deep-romantic font-heading">
                                                Your Anonymous Confession
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="I've been thinking about you for so long..."
                                                    className="w-full min-h-[200px] p-6 rounded-[20px] border-2 border-dashed border-[#FFC2E2] bg-white/80 text-lg font-body leading-relaxed resize-y shadow-inner transition-all duration-300 focus:border-solid focus:border-[#FF6B9D] focus:shadow-md focus:outline-none focus-visible:ring-0"
                                                    maxLength={1000}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <div className="flex justify-between items-center text-sm">
                                                <p className={`${messageLength > 900 ? 'text-[#FF6B9D] font-semibold' : 'text-gray-500'}`}>
                                                    {messageLength} / 1000 characters
                                                </p>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <div className="bg-pink-50/80 border-l-4 border-[#FF6B9D] p-5 rounded-r-xl">
                                    <h4 className="text-base text-[#C73866] font-semibold mb-2 font-heading">💡 Tips:</h4>
                                    <ul className="space-y-1.5 font-friendly text-sm text-gray-600">
                                        <li className="flex items-center gap-2"><span>💕</span> Be genuine and heartfelt</li>
                                        <li className="flex items-center gap-2"><span>✨</span> Share a specific memory or moment</li>
                                        <li className="flex items-center gap-2"><span>🎭</span> Don't give away who you are!</li>
                                    </ul>
                                </div>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        type="submit"
                                        disabled={createMutation.isPending}
                                        className="w-full h-14 text-xl font-bold rounded-[50px] bg-gradient-to-r from-[#FF6B9D] to-[#FFD700] text-white border-none shadow-[0_10px_30px_rgba(255,107,157,0.4)] hover:shadow-[0_15px_40px_rgba(255,107,157,0.6)] transition-all font-heading relative overflow-hidden"
                                    >
                                        {createMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-6 w-6 animate-spin inline-block" />
                                                Making magic happen... ✨
                                            </>
                                        ) : (
                                            <>
                                                {submitButtonText} <Sparkles className="ml-2 h-5 w-5 fill-white inline-block" />
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </Form>
                    </div>
                </motion.div>
            </div>

            <Dialog open={!!createdId} onOpenChange={() => {
                if (createdId) setCreatedId(null);
                setLocation("/"); // Go back to home after closing
            }}>
                <DialogContent className="glass-card sm:max-w-md border-2 border-pink-200 text-center p-8 shadow-2xl">
                    <DialogHeader>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="text-6xl mb-4 mx-auto"
                        >
                            💌
                        </motion.div>
                        <DialogTitle className="text-3xl text-center text-[#FF6B9D] font-heading">Confession Sent!</DialogTitle>
                        <DialogDescription className="text-center text-lg text-gray-600 mt-2 font-friendly">
                            Your secret is ready to be shared ✨
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-6 py-4">
                        <div className="bg-white p-4 rounded-xl border border-pink-200 w-full text-center break-all font-mono text-sm text-pink-600 shadow-sm">
                            {window.location.origin}/v/{createdId}
                        </div>
                        <Button
                            onClick={copyLink}
                            className="w-full h-12 text-lg bg-[#FF6B9D] hover:bg-[#C73866] text-white rounded-xl shadow-md font-heading"
                        >
                            <Copy className="mr-2 h-5 w-5" /> Copy Link
                        </Button>
                        <p className="text-xs text-gray-500 text-center italic">
                            Remember: Send this link to your crush! They'll never know it's you 🎭
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
