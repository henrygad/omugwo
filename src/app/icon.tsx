import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#7b2037",
        borderRadius: "14px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #d4aa69",
          borderRadius: "999px",
          color: "#fffaf2",
          fontFamily: "Georgia, serif",
          fontSize: "38px",
          fontStyle: "italic",
          lineHeight: 1,
        }}
      >
        O
      </div>
    </div>,
    size,
  );
}
