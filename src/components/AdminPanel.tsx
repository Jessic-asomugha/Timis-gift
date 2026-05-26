import React, { useState } from "react";
import { motion } from "motion/react";
import { Lock, Radio, MapPin, Sparkles, Send, CheckCircle2, ShieldAlert, ArrowLeft, RotateCcw, HelpCircle } from "lucide-react";
import { TrackerState, STAGES } from "../types";

interface AdminPanelProps {
  state: TrackerState;
  onUpdateState: (updated: Partial<TrackerState>) => Promise<void>;
  onResetState: () => Promise<void>;
  onBackToTracker: () => void;
}

export default function AdminPanel({ state, onUpdateState, onResetState, onBackToTracker }: AdminPanelProps) {
  // Authentication states
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Track if any field has been manually modified by the admin
  const [isDirty, setIsDirty] = useState(false);

  // Edit fields synchronized from current state
  const [selectedStage, setSelectedStage] = useState(state.stage);
  const [location, setLocation] = useState(state.location);
  const [estimatedArrival, setEstimatedArrival] = useState(state.estimatedArrival);
  const [customNote, setCustomNote] = useState(state.customNote);

  // Operation status states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Sync edits if the underlying state changed due to a server refresh, but only if not dirty
  React.useEffect(() => {
    if (!isDirty) {
      setSelectedStage(state.stage);
      setLocation(state.location);
      setEstimatedArrival(state.estimatedArrival);
      setCustomNote(state.customNote);
    }
  }, [state, isDirty]);

  // Handle password submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassword = password.trim().toLowerCase();
    
    // Accept standard simple passwords from Jess
    if (["jess", "jessica", "love", "gift", "surprise"].includes(cleanPassword)) {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Incorrect key. Authorization credentials required.");
    }
  };

  const handlePublishUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onUpdateState({
        stage: selectedStage,
        location,
        estimatedArrival,
        customNote,
      });
      setIsDirty(false); // Reset dirty flag so fresh saved values represent the base
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to post state updates:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetWorkflow = async () => {
    if (!window.confirm("Are you sure you want to reset the tracking package to Stage 1 with default message values?")) {
      return;
    }
    setIsResetting(true);
    try {
      await onResetState();
      setIsDirty(false); // Reset dirty flag on complete reset
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleQuickPresetSelection = (stageId: number) => {
    setSelectedStage(stageId);
    setIsDirty(true); // User made manual modification
    
    // Populate with whimsical stage-appropriate defaults automatically to save Jess typing speed!
    switch (stageId) {
      case 1:
        setLocation("Jess's Cozy Gift-Wrapping Station 🎀");
        setEstimatedArrival("Very soon! 👀❤️");
        setCustomNote("The tapes are cut, the ribbon is tied, and the packaging details are logged. The journey is about to begin!");
        break;
      case 2:
        setLocation("En Route to Local Sorting Depot 🚚");
        setEstimatedArrival("En route!");
        setCustomNote("A courier scanned it and placed it in the dispatch bin. Keep your fingers crossed!");
        break;
      case 3:
        setLocation("Cruising Down the Sunset Highway 🛣️");
        setEstimatedArrival("By tomorrow!");
        setCustomNote("Speeding past standard mail channels. The dog is currently staring at maps with pure enthusiasm.");
        break;
      case 4:
        setLocation("Arrived at Your Neighborhood Sorting Hub 📍");
        setEstimatedArrival("Within a few hours!");
        setCustomNote("The box has entered your postcode boundary! Close your eyes, it's virtually next door.");
        break;
      case 5:
        setLocation("On Delivery Vehicle - Turning Onto Your Street 👀");
        setEstimatedArrival("Any minute now!");
        setCustomNote("Look out the window! The shipping van is literally navigating your street. The dog is doing hyper-wags.");
        break;
      case 6:
        setLocation("Delivered Securely to Your Doorstep 🎉");
        setEstimatedArrival("Delivered 🎁");
        setCustomNote("Congratulations! The journey is done. Open the real gift and let the warm feelings wash over you!");
        break;
    }
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full mx-auto px-6 py-12 bg-white border border-stone-100 rounded-3xl shadow-[0_12px_42px_rgba(233,196,106,0.15)] flex flex-col items-center"
      >
        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
          <Lock size={24} />
        </div>

        <h2 className="text-xl font-bold text-stone-800 tracking-tight">
          Sender Control Station
        </h2>
        
        <p className="mt-2 text-stone-500 text-sm text-center max-w-xs">
          Only Jess or authorized delivery operators can update package coordinates for safety.
        </p>

        <form onSubmit={handleLogin} className="w-full mt-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-stone-500 uppercase tracking-wider mb-2">
              Secret Admin Key
            </label>
            <input
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-amber-500 rounded-xl focus:outline-none transition-all text-sm text-stone-800 text-center"
            />
          </div>

          {loginError && (
            <div className="text-xs text-rose-500 font-medium flex items-center justify-center gap-1.5 py-1">
              <ShieldAlert size={14} /> {loginError}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm rounded-xl shadow-md cursor-pointer transition"
          >
            Authenticate Admin
          </button>
        </form>

        {/* Password hint paper has been completely scrubbed for safety */}

        <button
          onClick={onBackToTracker}
          className="mt-6 flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 cursor-pointer font-mono"
        >
          <ArrowLeft size={12} /> Live tracking page
        </button>
      </motion.div>
    );
  }

  // LOGGED IN CONTROLS
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl w-full mx-auto p-1 text-stone-800"
    >
      <div className="bg-white border border-stone-100 rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 text-white">
          <div className="flex items-center gap-2">
            <Radio size={18} className="text-amber-400 animate-pulse" />
            <h3 className="font-bold tracking-tight text-sm font-sans uppercase">
              GPS Controller Dashboard
            </h3>
          </div>

          <button
            onClick={onBackToTracker}
            className="flex items-center gap-1 text-xs text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            Live Panel View <ArrowLeft size={12} />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          
          {/* RECEIVER ENGAGEMENT HEALTH STATUS info bar */}
          <div className="p-4 bg-amber-50/50 border border-amber-900/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase block text-amber-700 font-bold">
                Receiver Status Loop
              </span>
              <p className="text-sm font-semibold text-stone-800 leading-relaxed">
                Has the receiver decoded/opened the surprise gift box?
              </p>
            </div>
            
            <div>
              {state.stage === 6 && state.giftOpened ? (
                <span className="px-3.5 py-1.5 bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> YES! Opened ❤️
                </span>
              ) : (
                <span className="px-3.5 py-1.5 bg-stone-100 border border-stone-200 text-stone-500 text-xs font-bold rounded-lg block">
                  Not Opened Yet ⏳
                </span>
              )}
            </div>
          </div>

          {/* MAIN SETTINGS FORM */}
          <form onSubmit={handlePublishUpdate} className="space-y-6">
            
            {/* 1. SELECTION STAGE GRID */}
            <div>
              <label className="block text-xs font-bold font-mono uppercase text-stone-500 tracking-wider mb-3">
                1. Select Current Delivery Stage
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {STAGES.map((st) => {
                  const isActive = selectedStage === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleQuickPresetSelection(st.id)}
                      className={`p-3.5 border rounded-2xl text-left cursor-pointer transition-all flex flex-col gap-1.5 ${
                        isActive
                          ? "border-amber-500 bg-amber-50/40 shadow-[0_0_12px_rgba(217,119,6,0.12)] text-amber-900 ring-2 ring-amber-500/20"
                          : "border-stone-200 hover:border-stone-300 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{st.emoji}</span>
                        <span className="text-[9px] font-mono text-stone-400 font-bold uppercase">
                          Stage {st.id}
                        </span>
                      </div>
                      
                      <div className="mt-1">
                        <p className={`text-xs font-bold leading-none ${isActive ? "text-amber-800" : "text-stone-700"}`}>
                          {st.label}
                        </p>
                        <p className="text-[10px] text-stone-400 truncate mt-0.5">
                          {st.statusTitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. CUSTOM LOCATION & ARRIVAL INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* CURRENT LOCATION */}
              <div>
                <label className="block text-xs font-bold font-mono uppercase text-stone-500 tracking-wider mb-2 flex items-center gap-1">
                  <MapPin size={12} /> 2. Manual Package Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Jess's room, Edinburgh sorting center..."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-amber-500 rounded-xl focus:outline-none transition text-sm text-stone-800"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Appears alongside the live status pin in the receiver's tracker window.
                </p>
              </div>

              {/* ESTIMATED ARRIVAL */}
              <div>
                <label className="block text-xs font-bold font-mono uppercase text-stone-500 tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles size={12} /> 3. Estimated Arrival Text
                </label>
                <input
                  type="text"
                  value={estimatedArrival}
                  onChange={(e) => {
                    setEstimatedArrival(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Tonight!, In a few hours, Soon..."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-amber-500 rounded-xl focus:outline-none transition text-sm text-stone-800"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Appears alongside the estimated arrival timer box. Recommended: "Soon! 👀"
                </p>
              </div>

            </div>

            {/* 3. PERSONAL SURPRISE MESSAGE (CUSTOM NOTE) */}
            <div>
              <label className="block text-xs font-bold font-mono uppercase text-stone-500 tracking-wider mb-2">
                4. Whimsical Personal Note (Message to Receiver)
              </label>
              <textarea
                value={customNote}
                onChange={(e) => {
                  setCustomNote(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Write a sweet message, tracking commentary, or hint about the real gift..."
                rows={3}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-amber-500 rounded-xl focus:outline-none transition text-sm text-stone-800 font-sans"
              />
              <p className="text-[10px] text-stone-400 mt-0.5">
                Appears inside the stylized handwriting paper section on the tracker.
              </p>
            </div>

            {/* BUTTON SUBMIT OR STATUS */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-stone-100 pt-6 gap-4">
              <span className="text-[10px] font-mono text-stone-400">
                LATEST REVISION TIME: {new Date(state.lastUpdated).toLocaleTimeString()}
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Reset button trigger */}
                <button
                  type="button"
                  onClick={handleResetWorkflow}
                  disabled={isResetting}
                  className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition font-medium text-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Return to stage 1 defaults"
                >
                  <RotateCcw size={14} className={isResetting ? "animate-spin" : ""} />
                  Reset Tracker
                </button>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 sm:flex-initial px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-amber-600/10 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-75"
                >
                  {isSaving ? (
                    "Publishing..."
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle2 size={16} className="text-amber-200" />
                      GPS Status Updated!
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Publish GPS Update
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>

        </div>
      </div>

      {/* Instructional guidelines on how to operate */}
      <div className="mt-6 p-4 bg-stone-100 border border-stone-200 rounded-2xl flex items-start gap-3">
        <HelpCircle size={18} className="text-stone-400 shrink-0 mt-0.5" />
        <div className="text-xs text-stone-500 leading-relaxed">
          <span className="font-bold text-stone-700 block mb-0.5">How to orchestrate the surprise:</span>
          1. Share the public <a href="/track" target="_blank" className="font-semibold text-amber-700 underline underline-offset-2">/track</a> page link with your special someone.<br />
          2. Visit page <code className="bg-stone-200 px-1 rounded font-mono font-bold">/admin</code> from any browser to adjust coordinates.<br />
          3. When you are ready for delivery, select **Stage 6 (Delivered)**. The receiver's screen will immediately update to show the bouncy wrapping box. When they open it, confetti fires and they see your real-life card message!
        </div>
      </div>
    </motion.div>
  );
}
