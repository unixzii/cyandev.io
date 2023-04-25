import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

const font = fetch(
  new URL("../../../assets/fonts/Inter-Bold.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

export default async function Og(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title");
  if (!title) {
    return NextResponse.json({ err: "invalid request" }, { status: 400 });
  }

  const fontData = await font;
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#000",
          paddingLeft: "92px",
          paddingRight: "90px",
          color: "#fff",
          fontSize: 60,
          fontWeight: 600,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 92,
            top: 92,
            width: 80,
            height: 20,
            backgroundColor: "white",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingTop: "56px",
          }}
        >
          <div>{title}</div>
          <div
            style={{
              display: "flex",
              marginTop: "64px",
              fontSize: 32,
              color: "#666",
            }}
          >
            <span>{"//"}</span>
            <span style={{ color: "#fff" }}>Cyandev</span>
            <span>.app</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 600,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}
