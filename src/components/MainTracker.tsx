import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, ArrowLeft, RefreshCw, Calendar, MapPin, Sparkles, Heart } from "lucide-react";
import { TrackerState, STAGES } from "../types";
import DogMascot from "./DogMascot";
import ConfettiShower from "./ConfettiShower";

interface MainTrackerProps {
  state: TrackerState;
  onBack: () => void;
  onRefresh: () => Promise<void>;
  onOpenGift: () => Promise<void>;
}

export default function MainTracker({ state, onBack, onRefresh, onOpenGift }: MainTrackerProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const prevStageRef = useRef<number | null>(null);
  const prevStateRef = useRef<TrackerState | null>(null);
  const [notificationState, setNotificationState] = useState<string>("default");
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    setIsIframe(window.self !== window.top);
    if (!("Notification" in window)) {
      setNotificationState("unsupported");
    } else {
      setNotificationState(Notification.permission);
    }
  }, []);

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      alert("Browser push notifications are not supported by this browser.");
      return;
    }
    
    // If we're inside an iframe, let's warn the user and give them quick helper tip
    if (window.self !== window.top) {
      alert("⚠️ Browser standard rules block alerts inside embedded side panels! Please open standard standalone tab via 'Open Standalone Tab' button in the card below to click Allow! 🐾");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationState(permission);
      if (permission === "granted") {
        new Notification("Notifications Enabled! 🐾 Tracker Activated", {
          body: "Ruff ruff! I will notify you the second Master Jess updates your package tracker status!",
          icon: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=120&h=120"
        });
        playWoof();
      }
    } catch (e) {
      console.warn("Could not obtain notifications grant:", e);
      alert("Notification request blocked. Please direct-click the lock icon on the browser address bar to allow browser notifications! 🐾");
    }
  };

  // Play a beautiful acoustic chime on stage updates using self-contained Web Audio API
  const playChime = (type: "step" | "delivered" | "open") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      
      if (type === "step") {
        // High, cozy bubble pop chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
        
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "delivered") {
        // Double ding
        const osc1 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.connect(gain);
        gain.connect(ctx.destination);
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        osc1.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.4);
      } else if (type === "open") {
        // Rich warm crescendo chime
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
          
          osc.start(now + idx * 0.08);
          osc.stop(now + 1.2);
        });
      }
    } catch (e) {
      console.log("Audio feedback couldn't play:", e);
    }
  };

  // Pure Web Audio GSD Puppy Double Bark synthesiser
  const playWoof = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const barks = [0, 0.16]; // Quick adorable double-bark "ruff ruff!"
      
      barks.forEach((startOffset) => {
        const barkStart = now + startOffset;
        
        // Pitch triangle swept oscillator
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(390, barkStart);
        osc.frequency.exponentialRampToValueAtTime(120, barkStart + 0.11);
        
        oscGain.gain.setValueAtTime(0, barkStart);
        oscGain.gain.linearRampToValueAtTime(0.18, barkStart + 0.02);
        oscGain.gain.exponentialRampToValueAtTime(0.01, barkStart + 0.11);
        
        osc.start(barkStart);
        osc.stop(barkStart + 0.12);
        
        // Airy white noise band-pass filtered chunk for breathy dog vocal ruff
        const bufferSize = ctx.sampleRate * 0.11;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(420, barkStart);
        filter.frequency.exponentialRampToValueAtTime(180, barkStart + 0.09);
        filter.Q.setValueAtTime(4, barkStart);
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0, barkStart);
        noiseGain.gain.linearRampToValueAtTime(0.06, barkStart + 0.012);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, barkStart + 0.11);
        
        noiseNode.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        
        noiseNode.start(barkStart);
        noiseNode.stop(barkStart + 0.12);
      });
    } catch (e) {
      console.log("Woof sound could not play:", e);
    }
  };

  // Synchronized browser notifications and audio chime feedback engine
  useEffect(() => {
    if (prevStateRef.current !== null) {
      const p = prevStateRef.current;
      const c = state;
      
      const stageChanged = p.stage !== c.stage;
      const locationChanged = p.location !== c.location;
      const noteChanged = p.customNote !== c.customNote;
      const arrivalChanged = p.estimatedArrival !== c.estimatedArrival;

      if (stageChanged || locationChanged || noteChanged || arrivalChanged) {
        // Play acoustic updates chimes or dog vocal feedback
        if (stageChanged) {
          if (c.stage === 6) {
            playChime("delivered");
            setTimeout(() => playWoof(), 400);
          } else if (c.stage === 5) {
            playChime("step");
            setTimeout(() => playWoof(), 300);
          } else {
            playChime("step");
          }
        } else {
          // Play minor step pop sound for tactile update feedback
          playChime("step");
        }

        // Fire browser pop notifications if granted
        if ("Notification" in window && Notification.permission === "granted") {
          let title = "Package Updated! 🐾";
          let body = "";

          if (stageChanged) {
            const currentStageInfo = STAGES[c.stage - 1] || STAGES[0];
            title = `Stage updated: ${currentStageInfo.statusTitle} 🐾`;
            body = `GSD Puppy moved to: ${currentStageInfo.description}`;
          } else if (locationChanged) {
            title = "German Shepherd Updated Location! 📍";
            body = `New location: ${c.location || "On the move"}`;
          } else if (arrivalChanged) {
            title = "Estimated Delivery Update ⏰";
            body = `New estimated arrival: ${c.estimatedArrival || "Very soon!"}`;
          } else if (noteChanged) {
            title = "Personal Message from Jess! ❤️";
            body = `“${c.customNote || "Thinking of you!"}”`;
          }

          try {
            new Notification(title, {
              body,
              icon: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=120&h=120",
            });
          } catch (err) {
            console.warn("Notification draw failed:", err);
          }
        }
      }
    }
    // Maintain both refs for backward compatible triggers and complete comparisons
    prevStageRef.current = state.stage;
    prevStateRef.current = state;
  }, [state]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    // Simulate tiny extra delay for gorgeous visual rhythm
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const handleOpenGiftBox = async () => {
    playChime("open");
    await onOpenGift();
  };

  // Human-readable formatted date
  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " • " + date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch (_) {
      return "Just now";
    }
  };

  // Progress Bar percentage corresponding to stage
  const stagePercentages: Record<number, number> = {
    1: 8,
    2: 26,
    3: 45,
    4: 64,
    5: 82,
    6: 100,
  };
  const percentage = stagePercentages[state.stage] || 8;
  const currentStageInfo = STAGES[state.stage - 1] || STAGES[0];

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-6 md:py-10">
      {/* Floating Confetti system triggers when gift opened at stage 6 */}
      <ConfettiShower active={state.stage === 6 && state.giftOpened} />

      {/* Primary Card */}
      <div className="bg-white border border-stone-100 rounded-[32px] shadow-[0_16px_48px_-12px_rgba(197,184,163,0.3)] overflow-hidden">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-50 bg-stone-50/50">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer font-mono"
          >
            <ArrowLeft size={14} /> Welcome Screen
          </button>
          
          <div className="flex items-center gap-2">
            {/* Notification Subscription quick-trigger button */}
            {notificationState !== "unsupported" && (
              <button
                onClick={requestNotifications}
                title={notificationState === "granted" ? "Desktop Alerts Enabled! 🔔" : "Enable Desktop Alerts 🔔"}
                className={`p-2 rounded-xl transition-all cursor-[pointer] flex items-center justify-center ${
                  notificationState === "granted"
                    ? "bg-purple-100 text-purple-700 hover:bg-purple-200/60 font-bold"
                    : "bg-stone-100 text-stone-400 hover:text-stone-600"
                }`}
              >
                {notificationState === "granted" ? "🔔" : "🔕"}
              </button>
            )}

            {/* Audio Toggle button */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playChime("step");
              }}
              title={soundEnabled ? "Disable feedback sound" : "Enable feedback sound"}
              className={`p-2 rounded-xl transition-all cursor-[pointer] ${
                soundEnabled
                  ? "bg-amber-100/50 text-amber-800"
                  : "bg-stone-100 text-stone-400 hover:text-stone-600"
              }`}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Manual Sync Refresh */}
            <button
              onClick={handleManualRefresh}
              className={`p-2 rounded-xl cursor-pointer transition-all ${
                isRefreshing ? "bg-stone-100 text-stone-400" : "bg-stone-100 text-stone-600 hover:bg-stone-200/60"
              }`}
              disabled={isRefreshing}
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Dynamic Inner Body Area */}
        <div className="p-6 md:p-8">
          
          {/* STAGE 6 - GIFT UNWRAPPED & BOX UNTAPPED SURPRISE EXPERIENCE */}
          <AnimatePresence mode="wait">
            {state.stage === 6 ? (
              !state.giftOpened ? (
                /* THE SURPRISE BOX STAGE (DELIVERED BUT UNOPENED) */
                <motion.div
                  key="unopened-box"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -40, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="flex flex-col items-center text-center py-6"
                >
                  {/* Glowing halo */}
                  <div className="absolute w-72 h-72 bg-gradient-to-tr from-amber-200/50 to-pink-200/30 rounded-full blur-3xl -z-10" />

                  <span className="text-sm font-mono tracking-widest uppercase text-amber-700 bg-amber-50 px-3 py-1 rounded-full mb-4">
                    🎉 SUCCESSFUL DELIVERY
                  </span>

                  <h2 className="text-3xl font-bold tracking-tight text-stone-800 font-sans">
                    Your gift has arrived! 🎁
                  </h2>
                  <p className="mt-2 text-stone-500 font-sans text-sm max-w-sm">
                    A special package was delivered right into your virtual hands. Tap the glowing surprise box to open it!
                  </p>

                  {/* Gigantic Interactive Gift Box */}
                  <motion.div
                    id="gift-box-wrapper"
                    onClick={handleOpenGiftBox}
                    className="relative my-10 group cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Ring aura */}
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute -inset-4 bg-amber-400/25 rounded-full blur-xl outline-none"
                    />

                    {/* Highly stylized vector Gift Box drawing */}
                    <div className="w-40 h-40 flex flex-col items-center justify-center relative select-none">
                      {/* Ribbon bow on top */}
                      <motion.div
                        animate={{
                          rotate: [-3, 3, -3],
                          y: [0, -3, 0],
                        }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="text-6xl absolute top-0 z-20"
                      >
                        💝
                      </motion.div>
                      
                      {/* Box bottom */}
                      <div className="w-32 h-24 bg-rose-500 rounded-2xl relative shadow-2xl border-2 border-rose-600 flex items-center justify-center overflow-hidden">
                        {/* Horizontal yellow stripe */}
                        <div className="absolute inset-x-0 h-4 bg-amber-300 border-y border-amber-400" />
                        {/* Vertical yellow stripe */}
                        <div className="absolute inset-y-0 w-4 bg-amber-300 border-x border-amber-400" />
                        
                        <div className="z-10 text-rose-100 font-mono text-[10px] tracking-wider font-extrabold rotate-3 select-none">
                          JESS WITH LOVE
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <button
                    id="tap-to-open-indicator"
                    onClick={handleOpenGiftBox}
                    className="px-6 py-3 bg-stone-900 text-white rounded-2xl hover:bg-stone-800 font-medium transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-stone-900/10 text-sm"
                  >
                    <Sparkles size={16} className="text-amber-400 animate-pulse" />
                    Tap to Open Surprise
                  </button>
                </motion.div>
              ) : (
                /* THE FINAL REVEAL PAYOFF CARD (OPENED SURPRISE) */
                <motion.div
                  key="opened-surprise"
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 80, damping: 14 }}
                  className="flex flex-col items-center text-center py-4"
                >
                  {/* Floating heart spirits background */}
                  <div className="absolute w-80 h-80 bg-gradient-to-r from-pink-100 to-rose-100/40 rounded-full blur-3xl -z-10" />

                  <span className="text-xs font-mono font-bold tracking-widest text-[#E76F51] bg-rose-50 px-3 py-1 rounded-full mb-2">
                    SURPRISE REVEALED ✨
                  </span>

                  <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-800 font-sans leading-snug">
                    Open your <br />
                    real gift! ❤️
                  </h2>

                  {/* Adorable dancing mascot loops around */}
                  <div className="my-6 relative flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center">
                      <DogMascot stage={6} size="xl" soundEnabled={soundEnabled} />
                    </div>
                    
                    {/* Open gift container visual under pup */}
                    <div className="absolute -bottom-4 w-36 h-8 bg-stone-100 border border-stone-200/50 rounded-full flex items-center justify-center opacity-70">
                      <span className="text-neutral-500 font-mono text-[9px] font-bold">LID IS OFF! 🎉</span>
                    </div>
                  </div>

                  {/* Message paper sheet card */}
                  <motion.div
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-md bg-stone-50 border border-stone-100 rounded-2xl p-6 text-left shadow-inner relative"
                  >
                    {/* Tiny pins */}
                    <div className="absolute left-6 top-3 text-[10px] font-mono text-stone-400 flex items-center gap-1 uppercase">
                      <Calendar size={10} /> Date Delivered
                    </div>
                    <div className="absolute right-6 top-3 text-[9px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      COMPLETED
                    </div>

                    <div className="mt-4 pt-2 border-t border-stone-200/40 font-serif text-lg text-stone-700 leading-relaxed italic">
                      “Congratulations! Your tracking journey is over, but the excitement is just starting! Look up, and open the real envelope / gift from me now.”
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-stone-200/20 pt-3">
                      <Heart size={14} className="text-rose-500 fill-rose-500 animate-pulse" />
                      <span className="font-sans text-stone-600 font-semibold text-sm">Love, Jess.</span>
                    </div>
                  </motion.div>

                  <div className="mt-6 text-xs font-mono text-stone-400">
                    SINCERE CONGRATULATIONS ON YOUR SPECTACULAR DAY!
                  </div>
                </motion.div>
              )
            ) : (
              /* THE TRADITIONAL ON-THE-ROAD LIVE PACK TRACKER VIEW */
              <motion.div
                key="active-tracker"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Dog Mascot Stage Display Header with background block */}
                <div className="relative rounded-2xl bg-amber-50/30 border border-amber-900/5 p-6 flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute top-3 left-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] font-mono text-stone-500 select-none uppercase tracking-wider">
                      Live Delivery Tracker
                    </span>
                  </div>

                  {/* Stage-based interaction */}
                  <div className="my-4 flex flex-col items-center justify-center gap-1.5">
                    <DogMascot stage={state.stage} size="lg" soundEnabled={soundEnabled} />
                    <span className="text-[10px] font-mono text-amber-600/90 font-bold select-none animate-pulse">
                      🐾 Tap the puppy for fun tricks! 🐾
                    </span>
                  </div>

                  {/* Action Bubble overlay based on Stage Description */}
                  <div className="text-center max-w-md">
                    <span className="text-3xl filter drop-shadow">{currentStageInfo.emoji}</span>
                    <h3 className="mt-1 text-lg font-bold text-stone-800 font-sans">
                      {currentStageInfo.statusTitle}
                    </h3>
                    <p className="mt-1.5 text-xs text-stone-500 leading-relaxed">
                      {currentStageInfo.description}
                    </p>
                  </div>
                </div>

                {/* Desktop Notification Integration Card */}
                <div className="p-4 rounded-2xl bg-amber-50/20 border border-amber-900/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="p-2.5 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-base shadow-sm">
                      🔔
                    </span>
                    <div className="text-left">
                      <h4 className="font-bold text-stone-700">Real-Time Desktop Alerts</h4>
                      <p className="text-stone-500 text-[10px] leading-relaxed mt-0.5 max-w-sm">
                        {isIframe ? (
                          <span className="text-amber-800/90 font-medium">
                            🔒 Browser security restricts notification permissions inside side-panel chat frames (iframes). Open the standard tab to grant access!
                          </span>
                        ) : notificationState === "granted" ? (
                          "Active! Double barks and live desktop status banners are armed."
                        ) : notificationState === "denied" ? (
                          "Permission is blocked in this window. Reset site permissions to authorize alerts, or try standard standalone tab."
                        ) : (
                          "Get notified with doggy barks when Jess updates your package tracker!"
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {isIframe ? (
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whitespace-nowrap px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition cursor-pointer shadow-sm text-[11px] font-mono flex items-center gap-1 shrink-0 self-start sm:self-center"
                    >
                      Open Standard Tab ↗
                    </a>
                  ) : notificationState === "unsupported" ? (
                    <span className="text-stone-400 text-[9px] font-mono bg-stone-100 px-2 py-1 rounded shrink-0">
                      Unsupported Browser
                    </span>
                  ) : notificationState === "granted" ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 font-mono font-bold uppercase text-[9px] flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={requestNotifications}
                      className="whitespace-nowrap px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition cursor-pointer shadow-sm text-[11px] font-mono shrink-0 self-start sm:self-center"
                    >
                      Enable Alerts
                    </button>
                  )}
                </div>

                {/* Progress Visual Tracker Bar Frame */}
                <div className="space-y-4">
                  {/* Paw Print Progress Tracker Track */}
                  <div className="relative pt-6">
                    {/* Dog positioning container which floats left based on percentage */}
                    <div className="absolute top-0 w-full left-0 px-2 pointer-events-none transition-all duration-700 ease-out z-10" style={{ left: `calc(${percentage}% - 28px)` }}>
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                        className="bg-stone-900 text-amber-300 text-[10px] font-bold font-mono py-1 px-2.5 rounded-full shadow-md flex items-center gap-1 border border-amber-900/20 whitespace-nowrap"
                      >
                        🐕 Running Here!
                      </motion.div>
                    </div>

                    {/* Background line */}
                    <div className="h-2 bg-stone-100 rounded-full w-full relative">
                      {/* Highlighted active line */}
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Paw print timeline node markers */}
                    <div className="absolute inset-x-0 top-6 flex justify-between px-1.5">
                      {STAGES.map((s) => {
                        const isPast = s.id < state.stage;
                        const isCurrent = s.id === state.stage;
                        return (
                          <div key={s.id} className="flex flex-col items-center relative group">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all duration-300 ${
                                isPast
                                  ? "bg-amber-500 text-white shadow-sm"
                                  : isCurrent
                                  ? "bg-amber-100 border-2 border-amber-600 text-stone-800 animate-pulse scale-110"
                                  : "bg-white border-2 border-stone-200 text-stone-400"
                              }`}
                            >
                              {isPast ? "✓" : s.emoji}
                            </div>
                            
                            {/* Shortened descriptor label */}
                            <span
                              className={`text-[9px] font-mono mt-1 px-1 rounded transition-colors ${
                                isCurrent
                                  ? "font-bold text-amber-800 bg-amber-50"
                                  : isPast
                                  ? "text-stone-700 font-medium"
                                  : "text-stone-400"
                              }`}
                            >
                              ST.{s.id}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Empty Spacer to adjust for paw height */}
                  <div className="h-10" />
                </div>

                {/* Tracking Data Table (Location, Notes, EAD) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-stone-100 pt-6">
                  {/* Card 1: Live Status */}
                  <div className="p-4 bg-stone-50 rounded-2xl flex items-start gap-3">
                    <MapPin className="text-stone-400 shrink-0 mt-0.5" size={20} />
                    <div>
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold">
                        Current Location
                      </span>
                      <p className="mt-1 text-sm font-semibold text-stone-700 leading-tight">
                        {state.location || "On the move"}
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Estimated Landing */}
                  <div className="p-4 bg-stone-50 rounded-2xl flex items-start gap-3">
                    <Sparkles className="text-amber-500 shrink-0 mt-0.5" size={18} />
                    <div>
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold">
                        Estimated Arrival
                      </span>
                      <p className="mt-1 text-sm font-semibold text-stone-700 leading-tight">
                        {state.estimatedArrival || "Very soon!"}
                      </p>
                    </div>
                  </div>

                  {/* Notes panel Full Width */}
                  <div className="p-4 bg-amber-50/20 rounded-2xl md:col-span-2 border border-amber-900/5">
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold">
                      Personal Message from Sender
                    </span>
                    <p className="mt-1.5 text-xs text-stone-600 leading-relaxed italic">
                      “{state.customNote || "Thank you for being in my life! Sit back and watch the updates."}”
                    </p>
                  </div>
                </div>

                {/* Subtext timestamp details */}
                <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-stone-400 gap-2 border-t border-stone-50 pt-4">
                  <div>
                    TRACKING NO: <span className="font-bold text-stone-500">LOVE-JESS-{state.stage}00{state.stage}X</span>
                  </div>
                  <div>
                    LAST SIGNAL RECEIVED: {formatDateTime(state.lastUpdated)}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Safety message */}
      <div className="mt-6 text-center text-[10px] text-stone-400">
        This package tracker works in real-time. Created on custom sandbox node container specifically for Jess's surprise gift.
      </div>
    </div>
  );
}
