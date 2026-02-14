import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { NoButton } from "@/components/NoButton";
import { Loader2, Share2 } from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Confession } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FloatingHearts } from "@/components/FloatingHearts";

const SUBTITLES = [
    "Someone thinks you're adorable! 🥺",
    "You > My CGPA fr 📉",
    "Capybaras approve this message 🦦",
    "Mom said it's my turn to date you 😤",
    "Are you a loan? Coz you got my interest 💸",
    "Is your name Wi-Fi? I'm feeling a connection 📶",
];

export default function ConfessionViewer() {
    const [, params] = useRoute("/v/:id");
    const id = params?.id || "";

    const { data: confession, isLoading, error } = useQuery<Confession>({
        queryKey: ["confessions", id],
        queryFn: async () => {
            const res = await fetch(`/api/confessions/${id}`);
            if (!res.ok) throw new Error("Confession not found");
            return res.json();
        },
        enabled: !!id,
    });

    const updateStatus = useMutation({
        mutationFn: async (response: string) => {
            const res = await apiRequest("PATCH", `/api/confessions/${id}/status`, { response });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["confessions", id] });
        },
    });

    const [yesScale, setYesScale] = useState(1);
    const [subtitle, setSubtitle] = useState(SUBTITLES[0]);
    const [accepted, setAccepted] = useState(false);
    const [envelopeOpen, setEnvelopeOpen] = useState(false);
    const [letterVisible, setLetterVisible] = useState(false);

    useEffect(() => {
        setSubtitle(SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)]);

        // Envelope opening sequence
        if (!isLoading && confession && !confession.response) { // Only animate if not already responded
            const timer1 = setTimeout(() => setEnvelopeOpen(true), 1500);
            const timer2 = setTimeout(() => {
                setLetterVisible(true);
                // Confetti burst
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.5 },
                    colors: ['#FF6B9D', '#FFC2E2', '#FFD700', '#E6B8E8']
                });
            }, 2500);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        } else if (confession?.response === 'yes') {
            // If already accepted, show letter and success immediately
            setEnvelopeOpen(true);
            setLetterVisible(true);
            setAccepted(true);
        }

    }, [isLoading, confession]);

    const handleNoHover = () => {
        setYesScale((prev) => Math.min(prev + 0.2, 2.5));
    };

    const handleYesClick = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ["#FF6B9D", "#FFC2E2", "#FFD700", "#E6B8E8"]
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ["#FF6B9D", "#FFC2E2", "#FFD700", "#E6B8E8"]
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();

        updateStatus.mutate("yes");
        setAccepted(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF0F5] via-[#FFE5EC] to-[#FFC2E2]">
                <Loader2 className="h-12 w-12 text-[#FF6B9D] animate-spin mb-4" />
                <p className="text-[#C73866] font-medium animate-pulse">Loading feelings...</p>
            </div>
        );
    }

    if (error || !confession) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background">
                <h1 className="text-4xl mb-4 gradient-text font-heading">404: Heart Not Found 💔</h1>
                <p className="text-gray-600 mb-8 font-friendly">This link might be broken or expired.</p>
                <Button onClick={() => window.location.href = "/"}>Create Your Own</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-x-hidden">
            <FloatingHearts />

            <AnimatePresence mode="wait">
                {!letterVisible && !accepted ? (
                    <motion.div
                        key="envelope"
                        initial={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-center z-10"
                    >
                        <motion.div
                            animate={envelopeOpen ? { rotateX: -180, opacity: 0 } : { rotateX: 0, opacity: 1 }}
                            transition={{ duration: 1 }}
                            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
                            className="text-9xl mb-4 cursor-pointer"
                            onClick={() => setEnvelopeOpen(true)}
                        >
                            💌
                        </motion.div>
                        <p className="text-xl text-gray-600 font-friendly animate-pulse">
                            {envelopeOpen ? "Opening..." : "Tap to open your secret confession..."}
                        </p>
                    </motion.div>
                ) : !accepted ? (
                    <motion.div
                        key="question"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.5 }}
                        className="text-center z-10 max-w-3xl w-full"
                    >
                        {/* Main Heading */}
                        <motion.h1
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl md:text-6xl font-bold gradient-text-gold mb-8 font-heading"
                            style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
                        >
                            💌 You've Got a Secret Confession! 💌
                        </motion.h1>

                        {/* From Card */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-6 rounded-[20px] border-2 border-[#FFC2E2] shadow-lg mb-6 relative max-w-2xl mx-auto transform rotate-1"
                        >
                            <div className="absolute -top-5 right-6 text-4xl animate-bounce">
                                💌
                            </div>
                            <div className="text-sm uppercase text-gray-400 mb-2 font-friendly">From:</div>
                            <div className="text-2xl md:text-3xl font-bold gradient-text mb-4 font-script">
                                {confession.senderName} 💕
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 mb-4">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent"></div>
                                <span className="text-xs">💕</span>
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent"></div>
                            </div>
                            <div className="flex items-center justify-center gap-3 bg-gradient-to-br from-[#FFF0F5] to-[#FFE5EC] p-4 rounded-xl">
                                <span className="text-lg text-[#C73866] font-semibold font-friendly">
                                    {confession.intentOption}
                                </span>
                            </div>
                        </motion.div>

                        {/* Confession Message */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-white to-[#FFF0F5] p-8 rounded-[20px] relative my-6 max-w-2xl mx-auto shadow-xl"
                        >
                            <div className="font-script text-2xl md:text-3xl leading-relaxed text-[#4A4A4A] text-center relative z-10">
                                <span className="text-6xl text-[#FFC2E2] opacity-30 absolute -top-4 -left-2">"</span>
                                {confession.message}
                                <span className="text-6xl text-[#FFC2E2] opacity-30 absolute -bottom-8 -right-2">"</span>
                            </div>
                        </motion.div>

                        {/* Valentine Prompt */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-center my-12"
                        >
                            <h2 className="font-heading text-3xl md:text-5xl gradient-text mb-6">
                                💕 Will You Be My Valentine? 💕
                            </h2>

                            <p className="text-xl text-rose-400 font-medium mb-8 font-friendly animate-pulse">
                                {subtitle}
                            </p>

                            <div className="flex flex-col md:flex-row items-center justify-center gap-6 min-h-[120px]">
                                <motion.button
                                    layout
                                    style={{ scale: yesScale }}
                                    whileHover={{ scale: yesScale * 1.1, rotate: -2 }}
                                    whileTap={{ scale: yesScale * 0.9 }}
                                    onClick={handleYesClick}
                                    className="px-8 py-4 rounded-[50px] text-white font-semibold text-xl shadow-lg hover:shadow-xl transition-all min-w-[160px] bg-gradient-to-r from-[#FF6B9D] to-[#FF1493] font-heading z-20"
                                >
                                    Yes! 💖
                                </motion.button>

                                <div className="relative h-16 w-32 flex items-center justify-center z-10">
                                    <NoButton onHover={handleNoHover} />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center z-10 w-full max-w-3xl"
                    >
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl mb-8 border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-500"
                        >
                            <img
                                src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNtaWZzN3Z3Y3V5Y3V5Y3V5Y3V5Y3V5Y3V5Y3V5Y3V5Y3V5/26FLdmIp6wJr91JJK/giphy.gif"
                                alt="Celebration"
                                className="w-full h-auto"
                            />
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6 font-heading">
                            YAYYYYY! 🎉💖
                        </h1>

                        <div className="glass-card p-8 rounded-3xl border-4 border-pink-200 shadow-xl mb-12 max-w-lg mx-auto">
                            <p className="text-xl text-gray-600 mb-2 font-friendly">They said YES! 🎉</p>
                            <h2 className="text-4xl font-bold gradient-text mb-4 font-heading">It's a Match! 💖</h2>
                            <p className="text-xl text-gray-600 font-friendly">
                                "I knew you'd say yes!" - {confession.senderName}
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            className="mt-8 rounded-full border-2 border-pink-300 text-pink-500 hover:bg-pink-50"
                            onClick={() => window.location.href = "/"}
                        >
                            <Share2 className="mr-2 h-4 w-4" /> Create Your Own Link
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
