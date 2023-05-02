"use client";

import { useEffect, useRef } from "react";
import { useSpring, animated } from "@react-spring/web";

type DefaultRevealHighlightProps = {
  width: number;
  height: number;
  top: number;
  left: number;
  visible: boolean;
  pressed: boolean;
};

export function DefaultRevealHighlight(props: DefaultRevealHighlightProps) {
  const { width, height, top, left, visible, pressed } = props;
  const animationEnabledRef = useRef(false);
  const [springValues, springApi] = useSpring(() => {
    return {
      width: 0,
      height: 0,
      top: 0,
      left: 0,
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (animationEnabledRef.current) {
      springApi.start({
        to: { width, height, top, left },
        config: {
          tension: 270,
          friction: 30,
        },
      });
    } else {
      springApi.set({ width, height, top, left });
      animationEnabledRef.current = true;
    }
  }, [animationEnabledRef, springApi, width, height, top, left, visible]);

  const opacityTransitionDuration = pressed ? 0.1 : visible ? 0.2 : 0.4;
  useEffect(() => {
    if (visible) {
      return undefined;
    }

    const timerId = setTimeout(() => {
      animationEnabledRef.current = false;
    }, (opacityTransitionDuration / 2) * 1000);
    return () => {
      clearTimeout(timerId);
    };
  }, [animationEnabledRef, visible, opacityTransitionDuration]);

  return (
    <animated.div
      className="absolute pointer-events-none bg-reveal-highlight rounded-md -z-50"
      style={{
        width: springValues.width,
        height: springValues.height,
        left: springValues.left,
        top: springValues.top,
        opacity: visible ? (pressed ? 0.1 : 0.2) : 0,
        transition: `opacity ${opacityTransitionDuration}s ease`,
      }}
    />
  );
}
