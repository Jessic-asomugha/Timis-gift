import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface DogMascotProps {
  stage: number; // 1 to 6
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  soundEnabled?: boolean;
}

export default function DogMascot({ stage, size = "md", className = "", soundEnabled = true }: DogMascotProps) {
  // Local interaction states
  // 'idle' | 'bark' | 'clap' | 'sneeze' | 'speech' | 'backflip'
  const [activeGesture, setActiveGesture] = useState<"idle" | "bark" | "clap" | "sneeze" | "speech" | "backflip">("idle");
  const [thoughtText, setThoughtText] = useState<string | null>(null);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [isClappingLoop, setIsClappingLoop] = useState(false);
  const hasBackflippedOnStage6Ref = useRef(false);
  const ctxRef = useRef<any>(null);

  // Dimensions Map
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-40 h-40",
    lg: "w-56 h-56",
    xl: "w-72 h-72",
  };

  // Pure Visual - Beautiful Golden Retriever Palette!
  // Rich warm honey gold, fluffy floppy ears, soft cream highlights
  const goldRetriever = "#F3A243";    // Soft golden honey body
  const earGold = "#D88126";          // Cozy warm golden brown for beautiful floppy ears
  const snoutCream = "#FEF9E7";       // Warm butter cream for snout
  const chestFluff = "#FFF3CD";       // Light fluffy white-chest accent
  const innerPink = "#FADBD8";        // Pastel pink tongue and ear lining
  const noseCharcoal = "#23201F";     // Soft dark chocolate/charcoal nose and eyes
  const collarEmerald = "#10B981";    // Bright emerald ribbon/collar for contrast
  const goldTag = "#FBBF24";          // Shiny golden shiny name tag
  const blushPink = "#FCA5A5";        // Cute puppy blush spots

  // Rich Sourced Audio puppy barks using professional FM Synthesis
  const playSourcedDoubleBark = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!ctxRef.current) {
        ctxRef.current = new AudioCtx();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;

      // Double high-fidelity sweet doggy bark
      const barks = [
        { offset: 0.0, pitch: 360, duration: 0.09, vol: 0.28 },
        { offset: 0.14, pitch: 345, duration: 0.12, vol: 0.32 }
      ];

      barks.forEach((b) => {
        const start = now + b.offset;
        
        // Triangle oscillator for core structural vocal chest resonance
        const osc1 = ctx.createOscillator();
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(b.pitch, start);
        osc1.frequency.exponentialRampToValueAtTime(120, start + b.duration);

        // Sinusoidal sub-harmonic oscillator for cute warm "pup" depth
        const osc2 = ctx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(b.pitch * 0.7, start);
        osc2.frequency.exponentialRampToValueAtTime(80, start + b.duration);

        // Exponential volume envelope (crisp start, smooth tail decay)
        const mainGain = ctx.createGain();
        mainGain.gain.setValueAtTime(0, start);
        mainGain.gain.linearRampToValueAtTime(b.vol, start + 0.012);
        mainGain.gain.exponentialRampToValueAtTime(0.002, start + b.duration);

        // Lowpass filter simulates warm soft Golden throat sound (removes metal click)
        const throatFilter = ctx.createBiquadFilter();
        throatFilter.type = "lowpass";
        throatFilter.frequency.setValueAtTime(700, start);

        osc1.connect(throatFilter);
        osc2.connect(throatFilter);
        throatFilter.connect(mainGain);
        mainGain.connect(ctx.destination);

        osc1.start(start);
        osc1.stop(start + b.duration);
        osc2.start(start);
        osc2.stop(start + b.duration);

        // Generates breath friction/air rasp via short white noise buffer
        const bufferSize = ctx.sampleRate * b.duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(450, start);
        noiseFilter.frequency.exponentialRampToValueAtTime(190, start + b.duration);
        noiseFilter.Q.setValueAtTime(3.5, start);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0, start);
        noiseGain.gain.linearRampToValueAtTime(b.vol * 0.65, start + 0.01);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, start + b.duration);

        whiteNoise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        whiteNoise.start(start);
        whiteNoise.stop(start + b.duration);
      });
    } catch (e) {
      console.warn("Sound context error:", e);
    }
  };

  // High quality realistic wet puppy sneeze sound synthesiser
  const playSneezeSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!ctxRef.current) {
        ctxRef.current = new AudioCtx();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;

      // Inhale phase "Ah..."
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(380, now + 0.16);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.1);
      gain.gain.linearRampToValueAtTime(0, now + 0.16);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.17);

      // Sneeze blowout "Choo!" via highpass filtered burst
      const bufSize = ctx.sampleRate * 0.22;
      const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const hpFilter = ctx.createBiquadFilter();
      hpFilter.type = "highpass";
      hpFilter.frequency.setValueAtTime(2000, now + 0.16);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, now + 0.15);
      noiseGain.gain.linearRampToValueAtTime(0.28, now + 0.17);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noise.connect(hpFilter);
      hpFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now + 0.16);
      noise.stop(now + 0.38);
    } catch (e) {}
  };

  // Play a soft high-quality acoustic clapping sound
  const playClapPopSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!ctxRef.current) {
        ctxRef.current = new AudioCtx();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.07);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  };

  // Backflip Trigger (Executed ONCE on Stage 6)
  useEffect(() => {
    if (stage === 6 && !hasBackflippedOnStage6Ref.current) {
      hasBackflippedOnStage6Ref.current = true;
      triggerBackflipOnce();
    } else if (stage !== 6) {
      hasBackflippedOnStage6Ref.current = false;
    }
  }, [stage]);

  const triggerBackflipOnce = () => {
    setActiveGesture("backflip");
    playSourcedDoubleBark();
    
    // Bubble indicators for joy
    setThoughtText("OMG BACKFLIP! LOOK! ✨🎉");
    setShowSpeechBubble(true);

    setTimeout(() => {
      setActiveGesture("idle");
      setShowSpeechBubble(false);
    }, 1200);
  };

  // Click-to-Interact - Sequential random sequence of rich barks, sneezing, clapping, and kind messages!
  const handleDogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeGesture !== "idle") return; // Let current trick finish to maintain flow

    const actions: Array<"bark" | "clap" | "sneeze" | "speech" | "backflip"> = [
      "bark",
      "clap",
      "sneeze",
      "speech",
      "backflip"
    ];

    const chosen = actions[Math.floor(Math.random() * actions.length)];

    if (chosen === "bark") {
      setActiveGesture("bark");
      playSourcedDoubleBark();
      
      const barkPhrases = ["Ruff ruff! Welcome! ❤️", "Woof! High-five please! 🐾", "Auntie Jess says hello! ✨"];
      setThoughtText(barkPhrases[Math.floor(Math.random() * barkPhrases.length)]);
      setShowSpeechBubble(true);

      setTimeout(() => {
        setActiveGesture("idle");
        setShowSpeechBubble(false);
      }, 1000);

    } else if (chosen === "clap") {
      setActiveGesture("clap");
      setIsClappingLoop(true);
      setThoughtText("Yay! You are doing amazing! 👏👏🐾");
      setShowSpeechBubble(true);

      let count = 0;
      const interval = setInterval(() => {
        playClapPopSound();
        count++;
        if (count >= 5) clearInterval(interval);
      }, 220);

      setTimeout(() => {
        setIsClappingLoop(false);
        setActiveGesture("idle");
        setShowSpeechBubble(false);
        clearInterval(interval);
      }, 1800);

    } else if (chosen === "sneeze") {
      setActiveGesture("sneeze");
      playSneezeSound();
      setThoughtText("A-CHOO! 🤧 Oh, tickly nose!");
      setShowSpeechBubble(true);

      setTimeout(() => {
        setActiveGesture("idle");
        setShowSpeechBubble(false);
      }, 1400);

    } else if (chosen === "speech") {
      setActiveGesture("speech");
      playSourcedDoubleBark();

      const statements = [
        "Your package is totally safe with me! 🎁",
        "Wagging my tail as fast as light! ✨🐕",
        "Every update is signed with cozy barks! 📝",
        "Master Jess is watching the bell too! 🔔",
        "Golden retriever power activated! 🌟",
        "I love tracking surprises! 🐾⭐"
      ];

      setThoughtText(statements[Math.floor(Math.random() * statements.length)]);
      setShowSpeechBubble(true);

      setTimeout(() => {
        setActiveGesture("idle");
        setShowSpeechBubble(false);
      }, 3000);

    } else if (chosen === "backflip") {
      triggerBackflipOnce();
    }
  };

  // Head Passive Animations
  const headAnims = {
    1: { rotate: [0, -2, 2, 0], transition: { repeat: Infinity, duration: 4.5, ease: "easeInOut" } },
    2: { rotate: [-1, 2, -1], transition: { repeat: Infinity, duration: 1.6, ease: "easeInOut" } },
    3: { rotate: [-4, 4, -4], y: [-1, 1, -1], transition: { repeat: Infinity, duration: 0.9, ease: "easeInOut" } },
    4: { rotate: -8, y: 3 }, // Inquisitive side tilt
    5: { rotate: [-6, 6, -6], y: [-3, 3, -3], transition: { repeat: Infinity, duration: 0.55, ease: "easeInOut" } },
    6: { rotate: [0, -6, 6, -6, 6, 0], transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" } },
  };

  // Soft floppy ears passive bounce
  const earAnimsLeft = {
    1: { rotate: [0, -6, 0], transition: { duration: 4 } },
    2: { rotate: [-8, 8, -8], transition: { repeat: Infinity, duration: 1.6, ease: "easeInOut" } },
    3: { rotate: [-14, 18, -14], transition: { repeat: Infinity, duration: 0.9, ease: "easeInOut" } },
    4: { rotate: -18 },
    5: { rotate: [-24, 24, -24], transition: { repeat: Infinity, duration: 0.55, ease: "easeInOut" } },
    6: { rotate: [-16, 20, -16], transition: { repeat: Infinity, duration: 0.8, ease: "easeInOut" } },
  };

  const earAnimsRight = {
    1: { rotate: [0, 6, 0], transition: { duration: 4 } },
    2: { rotate: [8, -8, 8], transition: { repeat: Infinity, duration: 1.6, ease: "easeInOut" } },
    3: { rotate: [14, -18, 14], transition: { repeat: Infinity, duration: 0.9, ease: "easeInOut" } },
    4: { rotate: 18 },
    5: { rotate: [24, -24, 24], transition: { repeat: Infinity, duration: 0.55, ease: "easeInOut" } },
    6: { rotate: [16, -20, 16], transition: { repeat: Infinity, duration: 0.8, ease: "easeInOut" } },
  };

  // Highly refined fluffy tail wag metrics
  const tailAnims = {
    1: { rotate: [-4, 12, -4], transition: { repeat: Infinity, duration: 2.2, ease: "easeInOut" } },
    2: { rotate: [8, 30, 8], transition: { repeat: Infinity, duration: 0.85, ease: "easeInOut" } },
    3: { rotate: [12, 45, 12], transition: { repeat: Infinity, duration: 0.45, ease: "easeInOut" } },
    4: { rotate: [0, 8, 0], transition: { repeat: Infinity, duration: 1.6, ease: "easeInOut" } },
    5: { rotate: [-8, 55, -8], transition: { repeat: Infinity, duration: 0.22, ease: "easeInOut" } },
    6: { rotate: [-18, 48, -18], transition: { repeat: Infinity, duration: 0.32, ease: "easeInOut" } },
  };

  // Passive vertical hop bounds (Fluid Disney-like Squash & Stretch)
  const bodyHops = {
    1: { y: 0, rotate: 0, scaleY: 1, scaleX: 1 },
    2: { 
      y: [0, -6, 0], 
      scaleY: [1, 0.96, 1.04, 1],
      scaleX: [1, 1.03, 0.97, 1],
      transition: { repeat: Infinity, duration: 1.4, ease: "easeInOut" } 
    },
    3: { 
      y: [0, -11, 0], 
      scaleY: [1, 0.92, 1.08, 1],
      scaleX: [1, 1.05, 0.95, 1],
      rotate: [-1, 1, -1],
      transition: { repeat: Infinity, duration: 0.7, ease: "easeInOut" } 
    },
    4: { y: [0, -3, 0], transition: { repeat: Infinity, duration: 2.2, ease: "easeInOut" } },
    5: { 
      y: [0, -25, 0], 
      scaleY: [1, 0.82, 1.15, 1], 
      scaleX: [1, 1.1, 0.9, 1],
      transition: { repeat: Infinity, duration: 0.65, ease: "easeInOut" } 
    },
    // Stage 6 loop: Happy stand and clap, NO constant rotation loops
    6: { 
      y: [0, -10, 0], 
      scaleY: [1, 0.93, 1.06, 1], 
      scaleX: [1, 1.04, 0.96, 1],
      rotate: [-1, 1, -1], 
      transition: { repeat: Infinity, duration: 0.9, ease: "easeInOut" } 
    },
  };

  // Overwrites for Active Anim Gestures (Simulates true physics, squash, stretch, and spring)
  const getActiveBodyMotion = () => {
    if (activeGesture === "backflip") {
      // Beautiful vertical compression & high energetic leap inside the frame
      return {
        y: [0, 18, -110, -120, -100, 0],
        rotate: [0, -15, 180, 360, 360, 0], // Smooth full circle twist
        scaleY: [1, 0.72, 1.35, 1.25, 0.82, 1.1, 1], // Physics squash & stretch bounce
        scaleX: [1, 1.15, 0.8, 0.85, 1.14, 0.94, 1],
        transition: {
          duration: 1.1,
          times: [0, 0.15, 0.45, 0.65, 0.8, 1],
          ease: "easeInOut",
        },
      };
    }
    if (activeGesture === "bark") {
      return {
        y: [0, -16, 0],
        scaleY: [1, 0.86, 1.08, 1],
        scaleX: [1, 1.08, 0.94, 1],
        transition: { duration: 0.35, ease: "easeOut" }
      };
    }
    if (activeGesture === "clap") {
      // Gentle upright lift on hind legs
      return {
        y: -14,
        rotate: [0, -1.5, 1.5, -1.5, 0],
        scaleY: [1, 1.04, 1.04, 1],
        transition: { duration: 1.8 }
      };
    }
    if (activeGesture === "sneeze") {
      // Pull back tense inhale, sudden forward explosive sneeze slam!
      return {
        y: [0, 6, -10, 15, 0],
        rotate: [0, -6, -10, 14, 0],
        scaleY: [1, 1.12, 0.74, 1.05, 1],
        scaleX: [1, 0.9, 1.15, 0.95, 1],
        transition: {
          duration: 1.4,
          times: [0, 0.18, 0.45, 0.62, 1],
          ease: "easeInOut"
        }
      };
    }
    return bodyHops[stage as keyof typeof bodyHops] || bodyHops[1];
  };

  const getActiveHeadMotion = () => {
    if (activeGesture === "bark") {
      return { rotate: -12, y: -3 };
    }
    if (activeGesture === "sneeze") {
      return {
        rotate: [0, -10, -18, 20, -1, 0],
        y: [0, 1, -3, 6, 0],
        transition: { duration: 1.4, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
      };
    }
    if (activeGesture === "clap") {
      return {
        rotate: [0, 6, -6, 6, -6, 0],
        y: [-1, 1, -1, 1, 0],
        transition: { repeat: Infinity, duration: 0.55 }
      };
    }
    return headAnims[stage as keyof typeof headAnims] || headAnims[1];
  };

  return (
    <div 
      className={`relative ${sizeClasses[size]} ${className} flex items-center justify-center`}
    >
      {/* Speech Text Thought Comic Bubble */}
      <AnimatePresence>
        {showSpeechBubble && thoughtText && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.7, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: -10, scale: 0.8, x: "-50%" }}
            transition={{ type: "spring", stiffness: 130, damping: 13 }}
            className="absolute left-1/2 bottom-[104%] z-45 bg-stone-900 border border-amber-500/30 text-[10px] sm:text-xs font-sans font-bold text-amber-200 py-2.5 px-4 rounded-2xl shadow-xl w-48 text-center select-none"
            style={{ transform: "translateX(-50%)" }}
          >
            {thoughtText}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-stone-900" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Burst particles on special gesture beats */}
      {activeGesture !== "idle" && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {activeGesture === "sneeze" && (
            <>
              <motion.div
                className="absolute text-[10px]"
                initial={{ x: -4, y: -12, opacity: 1, scale: 0.5 }}
                animate={{ x: -45, y: 12, opacity: 0, scale: 1.4 }}
                transition={{ duration: 0.55 }}
                style={{ left: "45%", top: "45%" }}
              >
                💦
              </motion.div>
              <motion.div
                className="absolute text-[10px]"
                initial={{ x: 4, y: -12, opacity: 1, scale: 0.5 }}
                animate={{ x: 45, y: 12, opacity: 0, scale: 1.4 }}
                transition={{ duration: 0.55 }}
                style={{ left: "55%", top: "45%" }}
              >
                💧
              </motion.div>
            </>
          )}

          {activeGesture === "bark" && (
            <motion.div
              className="absolute border-2 border-amber-300 rounded-full w-20 h-20"
              initial={{ scale: 0.4, opacity: 0.9 }}
              animate={{ scale: 2.0, opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ left: "28%", top: "18%" }}
            />
          )}

          {activeGesture === "backflip" && (
            <motion.div
              className="absolute text-xl flex gap-1"
              initial={{ rotate: 0, y: 15, opacity: 1 }}
              animate={{ rotate: 360, y: -90, opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{ left: "40%", top: "30%" }}
            >
              <span>⭐</span>
              <span>✨</span>
            </motion.div>
          )}
        </div>
      )}

      {/* Idle background sparkles for happy delivery states */}
      {stage >= 5 && activeGesture === "idle" && (
        <div className="absolute inset-0 pointer-events-none overflow-visible z-10">
          <motion.div
            className="absolute text-rose-500 text-lg sm:text-2xl"
            initial={{ x: -15, y: 20, opacity: 0 }}
            animate={{
              y: -75,
              x: [-15, -35, -5, -25],
              opacity: [0, 1, 1, 0],
              scale: [0.6, 1.1, 0.7],
            }}
            transition={{ repeat: Infinity, duration: 2.1 }}
            style={{ left: "18%" }}
          >
            ❤️
          </motion.div>
          <motion.div
            className="absolute text-amber-500 text-lg sm:text-2xl"
            initial={{ x: 0, y: 30, opacity: 0 }}
            animate={{
              y: -95,
              x: [0, -10, 10, 0],
              opacity: [0, 1, 1, 0],
              scale: [0.6, 1.2, 0.8],
            }}
            transition={{ repeat: Infinity, duration: 2.4, delay: 0.8 }}
            style={{ left: "48%" }}
          >
            ⭐
          </motion.div>
        </div>
      )}

      {/* Main Interactive SVG Canvas */}
      <div 
        onClick={handleDogClick}
        className="w-full h-full cursor-pointer relative select-none transform transition hover:scale-[1.03] active:scale-[0.98]"
      >
        <motion.svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-xl overflow-visible"
          animate={getActiveBodyMotion()}
        >
          {/* Outer Soft Ambient Shadow */}
          <ellipse
            cx="100"
            cy="180"
            rx="52"
            ry="7.5"
            fill="#1E1E1E"
            opacity="0.12"
            className="transition-all duration-300"
          />

          {/* Golden Retriever Fluffy Tail */}
          <g className="origin-[132px_145px]">
            <motion.path
              // Fully designed Golden retriever flag-like plume fluffy tail
              d="M 132 145 C 150 145, 172 136, 186 112 C 193 100, 181 92, 171 106 C 158 122, 140 134, 132 141"
              fill={earGold}
              animate={activeGesture === "clap" ? { rotate: [-15, 55, -15], transition: { repeat: Infinity, duration: 0.22 } } : tailAnims[stage as keyof typeof tailAnims] || tailAnims[1]}
              className="origin-[132px_145px]"
            />
          </g>

          {/* Hind Limbs */}
          {stage === 1 && activeGesture !== "clap" ? (
            // Cozy sitting puppy thighs and paws
            <g>
              <ellipse cx="65" cy="158" rx="16" ry="12" fill={earGold} />
              <ellipse cx="135" cy="158" rx="16" ry="12" fill={earGold} />
              
              <rect x="52" y="158" width="16" height="15" rx="6" fill={goldRetriever} />
              <rect x="132" y="158" width="16" height="15" rx="6" fill={goldRetriever} />
              
              {/* Soft pink toe beans */}
              <circle cx="60" cy="166" r="4.5" fill={innerPink} opacity="0.8" />
              <circle cx="140" cy="166" r="4.5" fill={innerPink} opacity="0.8" />
            </g>
          ) : (
            // Bouncy standing/moving limbs
            <g>
              {/* Left Back Leg */}
              <motion.rect
                x="62"
                y="136"
                width="14"
                height="38"
                rx="7"
                fill={earGold}
                animate={stage >= 2 || activeGesture === "clap" ? {
                  rotate: stage === 3 ? [-12, 12, -12] : stage === 5 ? [-24, 24, -24] : [-6, 6, -6],
                } : {}}
                transition={{ repeat: Infinity, duration: stage === 3 ? 0.32 : stage === 5 ? 0.22 : 0.65, ease: "easeInOut" }}
                className="origin-[69px_140px]"
              />
              {/* Right Back Leg */}
              <motion.rect
                x="124"
                y="136"
                width="14"
                height="38"
                rx="7"
                fill={earGold}
                animate={stage >= 2 || activeGesture === "clap" ? {
                  rotate: stage === 3 ? [12, -12, 12] : stage === 5 ? [24, -24, 24] : [6, -6, 6],
                } : {}}
                transition={{ repeat: Infinity, duration: stage === 3 ? 0.32 : stage === 5 ? 0.22 : 0.65, ease: "easeInOut" }}
                className="origin-[131px_140px]"
              />
            </g>
          )}

          {/* Main Round Fluffy Body */}
          <g>
            {/* Fluffy torso body map */}
            <path
              d="M 68 108 C 55 136, 68 171, 100 171 C 132 171, 145 136, 132 108 C 122 98, 78 98, 68 108 Z"
              fill={goldRetriever}
            />
            {/* Pure Cream chest fluff highlight (Golden Retriever signature!) */}
            <path
              d="M 84 108 C 74 122, 78 143, 100 143 C 122 143, 126 122, 116 108 C 106 104, 94 104, 84 108 Z"
              fill={chestFluff}
            />
          </g>

          {/* Front Legs - Highly Responsive to Actions like Clapping! */}
          {activeGesture === "clap" || isClappingLoop ? (
            // STANDING CLAPPING ARMS (Beautiful rhythm!)
            <g>
              <motion.rect
                x="64"
                y="104"
                width="16"
                height="33"
                rx="8"
                fill={goldRetriever}
                animate={{
                  rotate: [20, 52, 20],
                  x: [0, 9, 0],
                }}
                transition={{ repeat: Infinity, duration: 0.2, ease: "easeInOut" }}
                className="origin-[72px_108px]"
              />
              <motion.rect
                x="120"
                y="104"
                width="16"
                height="33"
                rx="8"
                fill={goldRetriever}
                animate={{
                  rotate: [-20, -52, -20],
                  x: [0, -9, 0],
                }}
                transition={{ repeat: Infinity, duration: 0.2, ease: "easeInOut" }}
                className="origin-[128px_108px]"
              />
            </g>
          ) : stage === 1 ? (
            // Cozy resting front paws
            <g>
              <rect x="80" y="142" width="16" height="34" rx="8" fill={goldRetriever} />
              <rect x="104" y="142" width="16" height="34" rx="8" fill={goldRetriever} />
              <ellipse cx="88" cy="174" rx="8.5" ry="4" fill={earGold} />
              <ellipse cx="112" cy="174" rx="8.5" ry="4" fill={earGold} />
            </g>
          ) : (
            // Normal walking front limbs
            <g>
              <motion.rect
                x="76"
                y="136"
                width="14"
                height="36"
                rx="7"
                fill={goldRetriever}
                animate={stage >= 2 ? {
                  rotate: stage === 3 ? [18, -18, 18] : stage === 5 ? [22, -22, 22] : [9, -9, 9],
                } : {}}
                transition={{ repeat: Infinity, duration: stage === 3 ? 0.32 : stage === 5 ? 0.22 : 0.65, ease: "easeInOut" }}
                className="origin-[83px_140px]"
              />
              <motion.rect
                x="110"
                y="136"
                width="14"
                height="36"
                rx="7"
                fill={goldRetriever}
                animate={stage >= 2 ? {
                  rotate: stage === 3 ? [-18, 18, -18] : stage === 5 ? [-22, 22, -22] : [-9, 9, -9],
                } : {}}
                transition={{ repeat: Infinity, duration: stage === 3 ? 0.32 : stage === 5 ? 0.22 : 0.65, ease: "easeInOut" }}
                className="origin-[117px_140px]"
              />
            </g>
          )}

          {/* Ribbon Neck Collar */}
          <g>
            <path
              d="M 74 112 C 74 112, 100 119, 126 112"
              fill="none"
              stroke={collarEmerald}
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Engraved golden bell tag */}
            <motion.circle
              cx="100"
              cy="119"
              r="6.5"
              fill={goldTag}
              animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.2 }}
            />
            <circle cx="98" cy="117" r="1.5" fill="#FFFFFF" opacity="0.8" />
          </g>

          {/* Adorable Golden Retriever puppy head */}
          <motion.g
            className="origin-[100px_105px]"
            animate={getActiveHeadMotion()}
          >
            {/* Left Floppy Pendant Ear (Bounces with active motion) */}
            <g className="origin-[64px_68px]">
              <motion.path
                d="M 64 68 C 45 68, 36 94, 38 116 C 40 128, 56 128, 60 116 C 64 94, 65 80, 64 68 Z"
                fill={earGold}
                animate={activeGesture === "clap" ? { rotate: [-10, 15, -10], transition: { repeat: Infinity, duration: 0.5 } } : earAnimsLeft[stage as keyof typeof earAnimsLeft] || earAnimsLeft[1]}
                className="origin-[64px_68px]"
              />
              {/* Inner soft ear lining highlight */}
              <path
                d="M 61 74 C 50 74, 44 94, 45 110 C 47 118, 55 118, 58 110"
                fill={innerPink}
                opacity="0.45"
              />
            </g>

            {/* Right Floppy Pendant Ear */}
            <g className="origin-[136px_68px]">
              <motion.path
                d="M 136 68 C 155 68, 164 94, 162 116 C 160 128, 144 128, 140 116 C 136 94, 135 80, 136 68 Z"
                fill={earGold}
                animate={activeGesture === "clap" ? { rotate: [10, -15, 10], transition: { repeat: Infinity, duration: 0.5 } } : earAnimsRight[stage as keyof typeof earAnimsRight] || earAnimsRight[1]}
                className="origin-[136px_68px]"
              />
              {/* Inner soft ear lining highlight */}
              <path
                d="M 139 74 C 150 74, 156 94, 155 110 C 153 118, 145 118, 142 110"
                fill={innerPink}
                opacity="0.45"
              />
            </g>

            {/* Main Round Head core */}
            <ellipse cx="100" cy="85" rx="37" ry="33" fill={goldRetriever} />

            {/* Forehead cute creamy stripe */}
            <path
              d="M 95 53 C 95 53, 100 70, 100 75 C 100 75, 105 70, 105 53 Z"
              fill={snoutCream}
              opacity="0.85"
            />

            {/* Sweet Rosy Cheeks */}
            <circle cx="72" cy="94" r="5.5" fill={blushPink} opacity="0.7" />
            <circle cx="128" cy="94" r="5.5" fill={blushPink} opacity="0.7" />

            {/* Cute twinkling expressive big puppy eyes */}
            <g>
              {/* Glow back-orbits */}
              <circle cx="83" cy="83" r="10" fill={chestFluff} opacity="0.38" />
              <circle cx="117" cy="83" r="10" fill={chestFluff} opacity="0.38" />

              {activeGesture === "sneeze" ? (
                // Playfully closed sneeze eyes "><"
                <>
                  <path d="M 78 80 L 88 86 M 88 80 L 78 86" stroke={noseCharcoal} strokeWidth="3" strokeLinecap="round" />
                  <path d="M 112 80 L 122 86 M 122 80 L 112 86" stroke={noseCharcoal} strokeWidth="3" strokeLinecap="round" />
                </>
              ) : (
                <>
                  {/* Left Eye */}
                  <circle cx="83" cy="83" r="7.5" fill={noseCharcoal} />
                  <circle cx="80.5" cy="80.5" r="2.8" fill="#FFFFFF" /> {/* Large twinkle */}
                  <circle cx="85" cy="85" r="1.2" fill="#FFFFFF" /> {/* Secondary catchlight */}

                  {/* Right Eye */}
                  <circle cx="117" cy="83" r="7.5" fill={noseCharcoal} />
                  <circle cx="114.5" cy="80.5" r="2.8" fill="#FFFFFF" />
                  <circle cx="119" cy="85" r="1.2" fill="#FFFFFF" />
                </>
              )}
            </g>

            {/* Beautiful round warm snout */}
            <ellipse cx="100" cy="101" rx="17" ry="12" fill={snoutCream} />

            {/* Classic smiling mouth string */}
            <path
              d="M 93 100 C 96 102.5, 100 100, 100 102.5 C 100 100, 104 102.5, 107 100"
              fill="none"
              stroke={noseCharcoal}
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Cozy puppy tongue: active during barks, sneezes, or stage >= 2 */}
            {(stage >= 1 || activeGesture === "bark" || activeGesture === "sneeze") && (
              <motion.path
                d="M 97 102 C 97 102, 100 113, 100 113 C 100 113, 103 113, 103 102 Z"
                fill={innerPink}
                animate={activeGesture === "bark" ? { scaleY: 1.35, y: 0.8 } : { scaleY: 1 }}
                className="origin-top"
              />
            )}

            {/* Heart-shaped cute soft dog nose */}
            <path
              d="M 94 92 C 94 92, 100 87, 106 92 C 105 96.5, 95 96.5, 94 92 Z"
              fill={noseCharcoal}
            />
          </motion.g>
        </motion.svg>
      </div>
    </div>
  );
}
