import { ImageResponse } from "next/og";

// Image metadata
export const alt = "fitgather";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 128,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element*/}
        <img
          src="data:image/png;base64,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"
          width={557}
          height={129}
          alt={"App logo"}
        />
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
    },
  );
}
