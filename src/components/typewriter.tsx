import { useEffect, useRef } from "react";
import { useTick } from "@/utils";

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

function useTypewriter(snippets: string[]): [string, boolean] {
  const snippetsRef = useRef(snippets);
  const indexRef = useRef(0);
  const transitionRef = useRef<TypewriterTransitionState | null>(null);

  const transition = transitionRef.current;
  let idle = true;
  const tick = useTick(
    (() => {
      if (!transition) {
        return rangedRandom(1500, 3000);
      }
      const stage = transition.stage;
      if (stage == TypewriterTransitionStage.Inserting) {
        idle = false;
        return rangedRandom(50, 100);
      } else if (stage == TypewriterTransitionStage.ReadyToInsert) {
        return 200;
      } else {
        idle = false;
        return rangedRandom(30, 50);
      }
    })()
  );

  useEffect(() => {
    const snippets = snippetsRef.current;
    const currentIndex = indexRef.current;
    const nextIndex = (currentIndex + 1) % snippets.length;

    let transition = transitionRef.current;
    if (!transition) {
      transition = new TypewriterTransitionState(
        snippets[currentIndex],
        snippets[nextIndex]
      );
      transitionRef.current = transition;
      indexRef.current = nextIndex;
    } else {
      if (!transition.advance()) {
        // The transition is completed, release it for the
        // next one.
        transitionRef.current = null;
      }
    }
  }, [snippetsRef, indexRef, tick]);

  return [transitionRef.current?.current || snippets[indexRef.current], idle];
}

export type TypewriterProps = {
  snippets: string[];
};

export function Typewriter({ snippets }: TypewriterProps) {
  const [content, idle] = useTypewriter(snippets);
  return (
    <div className="text-sm md:text-lg">
      {content}
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
