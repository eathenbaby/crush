import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface NoButtonProps {
    onHover?: () => void;
}

export function NoButton({ onHover }: NoButtonProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const moveButton = () => {
        // Calculate mostly random position but try to stay within view relatively
        // Just random move for simplicity and chaos
        const x = (Math.random() - 0.5) * 300;
        const y = (Math.random() - 0.5) * 300;
        setPosition({ x, y });
        onHover?.();
    };

    return (
        <motion.div
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onMouseEnter={moveButton}
            onTapStart={moveButton} // Catch taps on mobile before click if possible
            className="inline-block relative z-50"
        >
            <Button
                variant="outline"
                className="rounded-[50px] border-2 border-gray-300 text-gray-500 hover:bg-gray-100 min-w-[120px] px-8 py-4 h-auto text-lg"
                onClick={moveButton}
            >
                No 😢
            </Button>
        </motion.div>
    );
}
