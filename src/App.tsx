import React, { useEffect, useState } from "react";
import WelcomeScreen from "./components/WelcomeScreen";
import MainTracker from "./components/MainTracker";
import AdminPanel from "./components/AdminPanel";
import { TrackerState } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Command, UserCheck } from "lucide-react";

export default function App() {
  // Navigation / Routing State
  const [pathname, setPathname] = useState(window.location.pathname);
  
  // Package Live Status State
  const [trackerState, setTrackerState] = useState<TrackerState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Track if receiver has clicked "Track My Gift" and entered active screen (persisted client side)
  const [hasStartedTracking, setHasStartedTracking] = useState(() => {
    try {
      return localStorage.getItem("has_started_tracking") === "true";
    } catch (_) {
      return false;
    }
  });

  // Track pathname route updates (handles browser back/forward buttons seamlessly)
  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Helper function to change client routes smoothly
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    setPathname(path);
  };

  // Main HTTP fetching function
  const fetchTrackerState = async () => {
    try {
      const response = await fetch("/api/tracker");
      if (!response.ok) {
        throw new Error("Could not retrieve tracking payload from server.");
      }
      const data: TrackerState = await response.json();
      setTrackerState(data);
      setErrorMsg("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to synchronize status.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch immediately on mount, then set up high-frequency sync polling
  useEffect(() => {
    fetchTrackerState();
    
    // Poll the server state every 2500ms for lightweight near-real-time coordination
    const interval = setInterval(() => {
      // Pause polling if the user is on the admin page to avoid overwriting typed fields
      if (window.location.pathname !== "/admin" && pathname !== "/admin") {
        fetchTrackerState();
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [pathname]);

  const handleUpdateTrackerState = async (updatedFields: Partial<TrackerState>) => {
    try {
      const response = await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      if (!response.ok) throw new Error("Could not post update to node server.");
      const result = await response.json();
      if (result.success && result.state) {
        setTrackerState(result.state);
      }
    } catch (e) {
      console.error("State update failed:", e);
      throw e;
    }
  };

  const handleOpenGiftBox = async () => {
    try {
      const response = await fetch("/api/tracker/open-gift", { method: "POST" });
      if (!response.ok) throw new Error("Could not register open-gift action.");
      const result = await response.json();
      if (result.success && result.state) {
        setTrackerState(result.state);
      }
    } catch (e) {
      console.error("Could not trigger open gift:", e);
    }
  };

  const handleResetWorkflow = async () => {
    try {
      const response = await fetch("/api/tracker/reset", { method: "POST" });
      if (!response.ok) throw new Error("Could not reset package workflow on server.");
      const result = await response.json();
      if (result.success && result.state) {
        setTrackerState(result.state);
        
        // Reset local tracker memory too
        setHasStartedTracking(false);
        localStorage.removeItem("has_started_tracking");
      }
    } catch (e) {
      console.error("Could not reset status:", e);
    }
  };

  const handleStartTrackingButton = () => {
    setHasStartedTracking(true);
    try {
      localStorage.setItem("has_started_tracking", "true");
    } catch (_) {}
    navigateTo("/track");
  };

  const handleResetStartTracking = () => {
    setHasStartedTracking(false);
    try {
      localStorage.removeItem("has_started_tracking");
    } catch (_) {}
    navigateTo("/track");
  };

  // Loading indicator overlay
  if (isLoading && !trackerState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] font-sans px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-xs font-mono text-stone-500 tracking-widest uppercase">
          Bundling Tracking Node...
        </p>
      </div>
    );
  }

  // Error boundary indicator
  if (errorMsg && !trackerState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] font-sans px-4 text-center">
        <span className="text-4xl mb-4">⚠️</span>
        <h2 className="text-lg font-bold text-stone-800">Connection Interrupted</h2>
        <p className="text-xs text-stone-500 mt-1 max-w-xs">{errorMsg}</p>
        <button
          onClick={() => {
            setIsLoading(true);
            fetchTrackerState();
          }}
          className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold transition cursor-pointer hover:bg-amber-700"
        >
          Check Signal Connection
        </button>
      </div>
    );
  }

  // Safety fallbacks to prevent runtime crashes
  const currentState = trackerState || {
    stage: 1,
    location: "Unknown Hub",
    estimatedArrival: "Calculating...",
    customNote: "Setting up package stream.",
    lastUpdated: new Date().toISOString(),
    giftOpened: false,
  };

  // Determine current routing template
  const isRoutingAdmin = pathname === "/admin";

  return (
    <div className="min-h-screen bg-[#FAF8F5] selection:bg-amber-100 flex flex-col justify-between">
      
      {/* Dynamic Content Body */}
      <main className="flex-1 flex items-center justify-center py-8">
        <AnimatePresence mode="wait">
          {isRoutingAdmin ? (
            // SENDER ROUTE
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full flex justify-center px-4"
            >
              <AdminPanel
                state={currentState}
                onUpdateState={handleUpdateTrackerState}
                onResetState={handleResetWorkflow}
                onBackToTracker={() => navigateTo("/track")}
              />
            </motion.div>
          ) : (
            // RECEIVER ROUTES (WELCOM vs TRUNCATED MAP PROGRESS)
            <div key="receiver-views" className="w-full flex justify-center px-4">
              {!hasStartedTracking ? (
                <WelcomeScreen onStartTracking={handleStartTrackingButton} />
              ) : (
                <MainTracker
                  state={currentState}
                  onBack={handleResetStartTracking}
                  onRefresh={fetchTrackerState}
                  onOpenGift={handleOpenGiftBox}
                />
              )}
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Beautiful discrete custom footer with absolutely zero clue of Admin/Sandbox switcher */}
      <footer className="py-6 px-4 shrink-0 flex items-center justify-center border-t border-stone-200/30 bg-white/10 text-[10px] font-mono text-stone-400">
        <span className="flex items-center gap-1">
          Made for tracking special surprises
          <Heart size={10} className="text-rose-500 fill-rose-500 animate-pulse" />
        </span>
      </footer>
    </div>
  );
}
