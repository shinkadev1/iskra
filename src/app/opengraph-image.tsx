import { ImageResponse } from "next/og";

export const alt = "neon chat — анонимный чат для знакомств и общения";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "#090a18",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "128px",
              height: "128px",
              borderRadius: "36px",
              background: "#0b0c1e",
              border: "6px solid #22d3ee",
              fontSize: "76px",
              fontWeight: 800,
              color: "#b9a8d8",
              lineHeight: 1,
            }}
          >
            n
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "96px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1,
            }}
          >
            neon chat
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "28px",
            fontSize: "40px",
            color: "#aeb2c6",
            lineHeight: 1.3,
          }}
        >
          Анонимный чат для знакомств и общения
        </div>
      </div>
    ),
    { ...size },
  );
}
