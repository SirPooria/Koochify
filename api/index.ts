let app: any = null;
let loadError: any = null;

try {
  const mod = await import("../server.ts");
  app = mod.default || mod.app;
} catch (err: any) {
  loadError = err;
  console.error("FATAL: Failed to load server.ts in Vercel serverless function:", err);
}

export default function handler(req: any, res: any) {
  if (loadError || !app) {
    return res.status(500).json({
      error: "SERVER_INITIALIZATION_ERROR",
      message: loadError?.message || "Application failed to initialize",
      stack: process.env.NODE_ENV !== "production" ? loadError?.stack : undefined,
    });
  }
  return app(req, res);
}
