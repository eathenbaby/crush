import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Sparkles() {
    const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);

    useEffect(() => {
        const newSparkles = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            delay: Math.random() * 5,
        }));
        setSparkles(newSparkles);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {sparkles.map((sparkle) => (
                <motion.div
                    key={sparkle.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0, 1, 0],
                    }}
                    transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: sparkle.delay,
                    }}
                    style={{
                        left: `${sparkle.x}%`,
                        top: `${sparkle.y}%`,
                        position: "absolute",
                    }}
                    className="w-1 h-1 bg-yellow-400 rounded-full shadow-[0_0_4px_rgba(255,215,0,0.8)]"
                />
            ))}
        </div>
    );
}
