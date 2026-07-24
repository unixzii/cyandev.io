import { useEffect, useMemo, useRef, useState } from "react";
import { BlurhashCanvas } from "react-blurhash";

export interface ImageProps {
  src?: string;
  alt?: string;
  title?: string;
}

type Metadata = {
  title: string;
  size: [number, number];
  blurhash: string;
};

function extractMetadata(s: string): Metadata | undefined {
  const firstSepIndex = s.indexOf(";");
  if (firstSepIndex === -1) {
    return undefined;
  }
  const title = s.substring(0, firstSepIndex);

  const secondSepIndex = s.indexOf(";", firstSepIndex + 1);
  if (secondSepIndex === -1) {
    return undefined;
  }
  const sizeString = s.substring(firstSepIndex + 1, secondSepIndex);
  const size = sizeString.split("x").map(Number);
  if (size.length !== 2 || isNaN(size[0]) || isNaN(size[1])) {
    return undefined;
  }

  const blurhash = s.substring(secondSepIndex + 1);
  return { title, size: size as [number, number], blurhash };
}

export function Image(props: ImageProps) {
  const { src, alt, title } = props;

  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const metadata = useMemo(() => {
    return extractMetadata(title || "");
  }, [title]);

  function updateLoaded() {
    const loaded = imgRef.current?.complete || false;
    setLoaded(loaded);
  }

  useEffect(() => {
    updateLoaded();
  }, [src, imgRef]);

  if (!metadata) {
    throw new Error("Invalid metadata");
  }

  const [width, height] = metadata.size;

  return (
    <div className="relative rounded-md overflow-hidden after:absolute after:inset-0 after:rounded-md after:inset-ring after:inset-ring-image-border">
      <BlurhashCanvas
        style={{
          display: "block",
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: -1,
          width: "100%",
          aspectRatio: `${width} / ${height}`,
        }}
        hash={metadata.blurhash}
        width={40}
        height={30}
      />
      <img
        className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={() => updateLoaded()}
      />
    </div>
  );
}
