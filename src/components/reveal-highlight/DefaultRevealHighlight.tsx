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

export default function DefaultRevealHighlight(
  props: DefaultRevealHighlightProps
) {
  const { width, height, top, left, visible, pressed } = props;
  const memorizedProps = useRef({
    width,
    height,
    top,
    left,
  });
  const animationEnabledRef = useRef(false);
  const [springValues, springApi] = useSpring(() => {
    if (visible) {
      Object.assign(memorizedProps.current, { width, height, top, left });
    }
    return {
      ...memorizedProps.current,
      config: {
        tension: 270,
        friction: 30,
      },
    };
  }, [memorizedProps, visible, width, height, top, left]);

  useEffect(() => {
    if (!animationEnabledRef.current && visible) {
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
