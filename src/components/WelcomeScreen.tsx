import React from "react";
import { motion } from "motion/react";
import DogMascot from "./DogMascot";

interface WelcomeScreenProps {
  onStartTracking: () => void;
}

export default function WelcomeScreen({ onStartTracking }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-md w-full mx-auto px-6 py-12 flex flex-col items-center text-center bg-white border border-stone-100 rounded-3xl shadow-[0_12px_40px_-12px_rgba(202,192,176,0.3)]"
    >
      {/* Visual Header Tag */}
      <span className="text-xs tracking-widest uppercase font-mono px-3 py-1 bg-amber-50 text-amber-800 rounded-full mb-6 font-semibold select-none">
        Special Delivery 📦
      </span>

      {/* Main Greeting */}
      <h1 className="font-sans text-3xl sm:text-4xl font-bold text-stone-800 tracking-tight leading-tight">
        A package is heading <br />
        <span className="text-amber-600">your way</span> 🎁
      </h1>

      {/* Personalized Love Subtext */}
      <p className="mt-3 text-stone-500 font-sans text-sm sm:text-base leading-relaxed">
        Sent with love from <span className="font-semibold text-stone-700 underline decoration-amber-400 decoration-2 underline-offset-4">Jess</span>.
      </p>

      {/* Hero Visual Area: Puppy beside a decorated surprise package */}
      <div className="my-8 relative flex flex-col items-center justify-center w-full">
        {/* Soft warmth background blob */}
        <div className="absolute w-52 h-52 bg-amber-100/40 rounded-full blur-2xl -z-10" />

        {/* Adorable Sitting Puppy */}
        <DogMascot stage={1} size="lg" className="mb-2" />

        {/* Corrugated Cute Package Cardboard Box Illustration */}
        <motion.div
          animate={{
            y: [0, -6, 0],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
          }}
          className="absolute bottom-5 right-6 sm:right-10 w-20 h-18 bg-stone-50 border-2 border-amber-900/15 rounded-xl shadow-lg flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Packaging details */}
          <div className="w-full h-3 bg-amber-700/60 absolute top-0" />
          {/* Sealer ribbon */}
          <div className="w-4 h-full bg-amber-800/10 absolute left-8 top-0" />
          
          <div className="flex flex-col items-center pt-2">
            <span className="text-2xl mt-1">🎀</span>
            <span className="text-[9px] font-mono text-stone-400 select-none">FRAGILE</span>
          </div>
        </motion.div>
      </div>

      {/* Call To Action Buttons */}
      <div className="w-full mt-4 space-y-4">
        <motion.button
          id="btn-track-my-gift"
          onClick={onStartTracking}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-2xl shadow-[0_4px_16px_rgba(217,119,6,0.25)] transition-all cursor-pointer text-sm sm:text-base"
        >
          Track My Gift
        </motion.button>
        
        <p className="text-[11px] font-mono text-stone-400">
          SECURE ENCRYPTED SURPRISE • NO CARRIERS NEEDED
        </p>
      </div>
    </motion.div>
  );
}
