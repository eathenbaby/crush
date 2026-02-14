import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

export function FloatingHearts() {
    const [hearts, setHearts] = useState<{ id: number; x: number; delay: number; scale: number }[]>([]);

    useEffect(() => {
        const newHearts = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 20,
            scale: Math.random() * 0.5 + 0.5,
        }));
        setHearts(newHearts);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {hearts.map((heart) => (
                <motion.div
                    key={heart.id}
                    initial={{ y: "110vh", opacity: 0, scale: heart.scale }}
                    animate={{
                        y: "-10vh",
                        opacity: [0, 0.4, 0],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 15 + Math.random() * 10,
                        repeat: Infinity,
                        delay: heart.delay,
                        ease: "linear",
                    }}
                    style={{
                        left: `${heart.x}%`,
                        position: "absolute",
                    }}
                >
                    <Heart className="text-pink-300 fill-pink-200" size={24} />
                </motion.div>
            ))}
        </div>
    );
}
