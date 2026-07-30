import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Inlined as a data URI (rather than referencing /public/brand/... by path)
// because next/og's Satori renderer doesn't reliably resolve relative
// public-folder paths at generation time — it needs the image bytes
// directly.
const LOGO_DATA_URI =
  "data:image/png;base64,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";

/** Next.js App Router convention: served as /opengraph-image and linked automatically in page metadata. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#101728",
          color: "#ECE8DD",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_DATA_URI} width={48} height={48} alt="" />
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>{siteConfig.name}</span>
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, maxWidth: 900, lineHeight: 1.15 }}>
          {siteConfig.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
