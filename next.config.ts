import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // community app: every route is personal (auth, feed) — classic
  // dynamic rendering, no cache-components prerender hastle
  cacheComponents: false,
  // CSP derived from the Supabase URL so it tracks env changes. Dev keeps
  // 'unsafe-inline'/'unsafe-eval' (Next HMR injects inline scripts) — drop
  // them from script-src when the production domain is finalized.
  async headers() {
    let remote = "";
    let wsRemote = "";
    try {
      const supa = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
      remote = ` ${supa.origin}`; // http://127.0.0.1:54321 or https://xyz.supabase.co
      wsRemote = ` ws://${supa.host} wss://${supa.host}`; // realtime: local uses ws, hosted uses wss
    } catch {
      // env unset — no remote sources
    }
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${
        process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"
      }`,
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob:${remote}`,
      `connect-src 'self'${remote}${wsRemote}`,
      "font-src 'self' data:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
