"use client";

import { useReducer, useRef } from "react";
import { useDelayedEffect } from "@/utils";

enum TypewriterTransitionStage {
  Deleting = 0,
  ReadyToInsert = 1,
  Inserting = 2,
  Idle = 3,
}

class TypewriterTransitionState {
  private _current: string;
  private _target: string;
  private _commonPrefixLength: number;
  private _stage: TypewriterTransitionStage;

  constructor(from: string, to: string) {
    this._current = from;
    this._target = to;

    // Find the common prefix.
    const walkLength = Math.min(from.length, to.length);
    let lastCommonIndex = -1;
    for (let index = 0; index < walkLength; ++index) {
      if (from[index] === to[index]) {
        lastCommonIndex = index;
      } else {
        break;
      }
    }
    if (lastCommonIndex >= 0 && to[lastCommonIndex] === " ") {
      // Trim to the last non-whitespace character.
      --lastCommonIndex;
    }
    this._commonPrefixLength = lastCommonIndex + 1;

    this._stage = TypewriterTransitionStage.Deleting;
  }

  get current(): string {
    return this._current;
  }

  get target(): string {
    return this._target;
  }

  get stage(): TypewriterTransitionStage {
    return this._stage;
  }

  advance(): boolean {
    const stage = this._stage;
    if (stage == TypewriterTransitionStage.Deleting) {
      this._advanceDeleting();
    } else if (stage == TypewriterTransitionStage.ReadyToInsert) {
      this._stage = TypewriterTransitionStage.Inserting;
    } else if (stage == TypewriterTransitionStage.Inserting) {
      this._advanceAdding();
    } else {
      return false;
    }
    return true;
  }

  private _advanceDeleting() {
    if (this._current.length > this._commonPrefixLength) {
      this._current = this._current.slice(0, -1);
    } else {
      this._stage = TypewriterTransitionStage.ReadyToInsert;
    }
  }

  private _advanceAdding() {
    if (this._current.length < this._target.length) {
      this._current += this._target[this._current.length];
    } else {
      this._stage = TypewriterTransitionStage.Idle;
    }
  }
}

function rangedRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

type UseTypewriterState = UseTypewriter & { delay: number; ticks: number };
type UseTypewriterAction = {
  currentString: string;
  targetString: string;
  stage: TypewriterTransitionStage | undefined;
};

type UseTypewriter = {
  currentString: string;
  targetString: string;
  idle: boolean;
};
function useTypewriter(snippets: string[]): UseTypewriter {
  const snippetsRef = useRef(snippets);
  const indexRef = useRef(0);
  const transitionRef = useRef<TypewriterTransitionState | null>(null);
  const [{ currentString, targetString, idle, delay, ticks }, update] =
    useReducer(
      (
        { ticks: prevTicks }: UseTypewriterState,
        { currentString, targetString, stage }: UseTypewriterAction
      ) => {
        let nextDelay: number;
        let nextIdle = false;
        if (stage === undefined) {
          nextDelay = rangedRandom(1500, 3000);
          nextIdle = true;
        } else {
          if (stage == TypewriterTransitionStage.Inserting) {
            nextDelay = rangedRandom(50, 100);
          } else if (stage == TypewriterTransitionStage.ReadyToInsert) {
            nextDelay = 200;
            nextIdle = true;
          } else {
            nextDelay = rangedRandom(30, 50);
            nextIdle = false;
          }
        }
        return {
          currentString,
          targetString,
          idle: nextIdle,
          delay: nextDelay,
          ticks: prevTicks + 1,
        };
      },
      {
        currentString: snippets[0],
        targetString: snippets[0],
        idle: true as boolean,
        delay: 2000,
        ticks: 0,
      }
    );

  useDelayedEffect(
    delay,
    () => {
      const snippets = snippetsRef.current;
      const currentIndex = indexRef.current;
      const nextIndex = (currentIndex + 1) % snippets.length;

      let transition = transitionRef.current;
      let currentString: string;
      let targetString: string;
      if (!transition) {
        // No `transition` means this is the initial render or it
        // is time to go to the next snippet.
        transition = new TypewriterTransitionState(
          snippets[currentIndex],
          snippets[nextIndex]
        );
        transitionRef.current = transition;
        indexRef.current = nextIndex;
        currentString = transition.current;
        targetString = transition.target;
      } else {
        const running = transition.advance();
        currentString = transition.current;
        targetString = transition.target;
        if (!running) {
          // The transition is completed, release it for the
          // next one.
          transitionRef.current = null;
          transition = null;
        }
      }

      update({ currentString, targetString, stage: transition?.stage });
    },
    [snippetsRef, indexRef, update, ticks]
  );

  return {
    currentString,
    targetString,
    idle,
  };
}

export type TypewriterProps = {
  snippets: string[];
};

export function Typewriter({ snippets }: TypewriterProps) {
  const {
    currentString: content,
    targetString: description,
    idle,
  } = useTypewriter(snippets);
  return (
    <div className="text-sm md:text-lg">
      <div
        className="absolute w-0 h-0 overflow-hidden"
        role="marquee"
        aria-label="a description with typewriter effect"
      >
        {description}
      </div>
      <div className="inline" aria-hidden="true">
        {content}
      </div>
      <div
        className={`inline-block w-1 ml-0.5 bg-caret text-transparent rounded-sm select-none ${
          idle ? "animate-smooth-blink" : ""
        }`}
      >
        |
      </div>
    </div>
  );
}
