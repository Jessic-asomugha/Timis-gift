import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface TrackerState {
  stage: number; // 1 to 6
  location: string;
  estimatedArrival: string;
  customNote: string;
  lastUpdated: string;
  giftOpened: boolean;
}

// In-memory data store with adorable initial state
let state: TrackerState = {
  stage: 1,
  location: "Jess's Cozy Gift-Wrapping Station 🎀",
  estimatedArrival: "Very soon! 👀❤️",
  customNote: "The tapes are cut, the ribbon is tied, and the packaging details are logged. The journey is about to begin!",
  lastUpdated: new Date().toISOString(),
  giftOpened: false,
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON request body parser
  app.use(express.json());

  // API Endpoints
  app.get("/api/tracker", (req, res) => {
    res.json(state);
  });

  app.post("/api/tracker", (req, res) => {
    const { stage, location, estimatedArrival, customNote } = req.body;

    if (typeof stage === "number" && stage >= 1 && stage <= 6) {
      state.stage = stage;
      state.lastUpdated = new Date().toISOString();
      
      if (location !== undefined) state.location = location;
      if (estimatedArrival !== undefined) state.estimatedArrival = estimatedArrival;
      if (customNote !== undefined) state.customNote = customNote;

      // Automatically reset giftOpen status if stage is changed away from Delivered
      if (stage !== 6) {
        state.giftOpened = false;
      }

      res.json({ success: true, state });
    } else {
      res.status(400).json({ error: "Invalid stage. Must be between 1 and 6." });
    }
  });

  // Action to toggle the surprise box opening
  app.post("/api/tracker/open-gift", (req, res) => {
    state.giftOpened = true;
    state.lastUpdated = new Date().toISOString();
    res.json({ success: true, state });
  });

  // Action to reset entire state for a fresh surprise
  app.post("/api/tracker/reset", (req, res) => {
    state = {
      stage: 1,
      location: "Jess's Cozy Gift-Wrapping Station 🎀",
      estimatedArrival: "Very soon! 👀❤️",
      customNote: "The tapes are cut, the ribbon is tied, and the packaging details are logged. The journey is about to begin!",
      lastUpdated: new Date().toISOString(),
      giftOpened: false,
    };
    res.json({ success: true, state });
  });

  // Vite middleware for development vs static build files for production
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
