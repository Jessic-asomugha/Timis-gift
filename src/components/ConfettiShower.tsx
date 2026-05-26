import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

interface ConfettiPiece {
  id: number;
  x: number; // starting left percent (0 to 100)
  size: number; // in pixels
  color: string;
  delay: number; // animation delay in seconds
  duration: number; // falling duration in seconds
  rotate: number; // random rotation speed/angle
  shape: "circle" | "square" | "triangle";
}

const COLORS = [
  "#FF6B6B", // coral pink
  "#4D96FF", // soft blue
  "#6BCB77", // mint green
  "#FFD93D", // pastel gold
  "#FF9F43", // orange accent
  "#E07A5F", // terracotta
  "#F28482", // blush rose
];

const SHAPES: Array<"circle" | "square" | "triangle"> = ["circle", "square", "triangle"];

export default function ConfettiShower({ active = true }: { active?: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    // Generate 120 random pieces
    const newPieces: ConfettiPiece[] = Array.from({ length: 125 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // 0vw to 100vw
      size: Math.floor(Math.random() * 8) + 8, // 8px to 16px
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 3, // staggered entry
      duration: Math.random() * 2.5 + 2.5, // 2.5s to 5s fall
      rotate: Math.random() * 720 - 360, // crazy spin
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    }));

    setPieces(newPieces);
  }, [active]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((piece) => {
        const renderShape = () => {
          switch (piece.shape) {
            case "circle":
              return (
                <div
                  className="rounded-full w-full h-full"
                  style={{ backgroundColor: piece.color }}
                />
              );
            case "triangle":
              return (
                <div
                  className="w-0 h-0 border-solid"
                  style={{
                    borderLeftWidth: `${piece.size / 2}px`,
                    borderLeftColor: "transparent",
                    borderRightWidth: `${piece.size / 2}px`,
                    borderRightColor: "transparent",
                    borderBottomWidth: `${piece.size}px`,
                    borderBottomColor: piece.color,
                  }}
                />
              );
            case "square":
            default:
              return (
                <div
                  className="w-full h-full transform"
                  style={{ backgroundColor: piece.color }}
                />
              );
          }
        };

        return (
          <motion.div
            key={piece.id}
            className="absolute top-0 transform -translate-y-12"
            style={{
              left: `${piece.x}%`,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
            }}
            initial={{ y: -50, opacity: 0, rotate: 0 }}
            animate={{
              y: "105vh",
              opacity: [0, 1, 1, 0.4, 0],
              x: [0, Math.sin(piece.id) * 35, Math.sin(piece.id + 1) * 20], // gentle swaying down
              rotate: piece.rotate,
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: "easeOut",
              repeat: Infinity,
            }}
          >
            {renderShape()}
          </motion.div>
        );
      })}
    </div>
  );
}
