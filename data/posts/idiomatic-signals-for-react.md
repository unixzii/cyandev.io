---
title: Idiomatic Signals for React
tag: React
description: A beautiful danger.
date: "2023-05-13T04:45:08.334Z"
---

If you’ve ever used Vue or MobX, you may enjoy the convenience of their reactivity feature. Reactivity makes our life easier when handling state management (which is a inevitable puzzle for React). Similarly, SolidJS has a reactivity concept with the term **“signal”**.

# What is Signal

According to the description from SolidJS:

> "Signals are the cornerstone of reactivity in Solid. They contain values that change over time; when you change a signal's value, it automatically updates anything that uses it."

It’s pretty like reactive objects, but the key difference is that signals are **atomic values**. That means you shouldn’t expect updates of an object signal will trigger when its inner properties change.

To simplify the code for complex scenarios, Solid provides [stores](https://www.solidjs.com/docs/latest/api#stores) for nested signals. But I’m not gonna elaborate on it in this post, documentations should be very clear.

Signals unlocked a whole new way to build UI, with deterministic updates, while preserving the flexibility of JSX (comparing to Vue). The trick behind it is the structural tags that replace the traditional control flows.

Let’s take a look at this simple example:

```jsx
function Counter() {
  const [count, setCount] = createSignal(0);

  setInterval(() => setCount(count() + 1), 1000);

  return <div>Count: {count()}</div>;
}
```

The component has an internal state `count`, every second it will be increased. However, what’s good in Solid is that the render function will be called only once, no matter how many times its state changes. In fact, there is no state concept in Solid, signals are just the dependencies of a piece of JSX!

## How does it even work?

So what makes the magic happen? The transformed code reveals everything:

```jsx{9}
const _tmpl$ = _$template(`<div>Count: </div>`, 2);

function Counter() {
  const [count, setCount] = createSignal(0);

  setInterval(() => setCount(count() + 1), 1000);

  return (() => {
    const _el$ = _tmpl$.cloneNode(true);
    _$insert(_el$, count, null);
    return _el$;
  })();
}
```

It turned out that the signal is set to the DOM element directly. The element (wrapped by Solid, of course) observes the signal it receives, and when the signal has updates, the element will also update. Without any diff-patch algorithm, you get a reactive view. Just like value binding in MVVM pattern, they share pretty similar ideas.

## Is it functional programming?

In my opinion, **no**. Functional programming means the same inputs evaluate to the same outputs, and different inputs (may) evaluate to different outputs. Anyway, the relationship between input and output is determined, just like a function in mathematics. React uses this character to make views driven by data only (if we don’t take effects into consideration here).

Solid, as well as Vue, use declarative ways to describe what a view should look like with a set of inputs, no matter what value these inputs have. Structural changes are already reflected in the component signature, even before it’s evaluated.

There are also other frameworks like SwiftUI that use this technique to optimize their rendering performance. But that doesn’t mean any of them are functional.

Vue allows you to implement `render` method to build views with more flexible JSX. By doing so, Vue will fallback to traditional virtual DOM rendering mechanism, without any compile-time hints. However, Solid will not let you do it, it literally breaks the whole idea of how Solid works.

To recap, declarative and functional are **not identical**. Functional is a **subset** of declarative.

# Preact Signal for React

Have you ever used or heard of it? Preact officially supports the signal concept, and it’s possible from the perspective of its internal implementation. Additionally, it does support React, making the same DX!

Is it good? I’d say possibly no. And Dan also [shouted out](https://twitter.com/dan_abramov/status/1650892432119148546) to the team, because it really [broke React’s internal things](https://github.com/facebook/react/issues/26704).

## What’s wrong?

In the mental model we’ve already built, React re-renders the view only when the props or state change. Now take a look at this code snippet:

```jsx
import { signal } from "@preact/signals-react";

const count = signal(0);

function CounterValue() {
  return <p>Value: {count.value}</p>;
}
```

Can you tell when it will re-render? The component has no props or state, it should not update anymore once it’s mounted. That is our expectation and mental model.

If you read carefully, you will notice there is another bad issue: the component uses variables outside it!

A component can use constants from outer scopes, but it shouldn’t use variables. It has the same impact as [reading a ref value inside a render function](https://react.dev/learn/referencing-values-with-refs#best-practices-for-refs), which makes the component **impure**.

Wait, isn’t `count` a constant already? Yes, `count` itself is constant, but its `value` property is not.

Unfortunately, JavaScript doesn’t have built-in immutable data structure, and maybe you have already read values from arrays or objects in your components. But they are logically different.

Reading properties of an object passed in by props is fine, because it’s immutable logically. You wouldn’t expect anything to change once they are presented as either props or state. In this case, `count` is a signal and it’s shared across modules, which means it can be changed over time.

If you really need some values that can change other than props, it’s the time to consider using hooks.

## What makes hooks so special?

Since React components can only render their contents from props, it’s insufficient for some complex scenarios that we must change some internal state. React takes an idea called **“Algebraic Effect”**. If you haven’t heard about it, I highly recommend you to read [this post](https://overreacted.io/algebraic-effects-for-the-rest-of-us/) first.

To simply put, algebraic effect let you perform side effects in a function while keeping it pure. For example:

```jsx
function Counter() {
  const [count] = useState(0);
  return <p>Value: {count.value}</p>;
}
```

The component doesn’t have any props, but relies on an internal state. The state is agnostic by other components or the execution environment.

> **Note:**
>
> All of the things showed below are hypothetical, it’s not how React actually works!

How can our component fetch its state? It performs an effect. The effect, which can be imagined as a black box, helps you store something in the execution context and returns the current value back. The process written in algebraic-effect fashion is like:

```jsx{1,12,21}
function Counter() {
	const [count] = perform State(0);
  // `count` is based on the execution context.
	return <p>Value: {count.value}</p>;
}

function render() {
  const context = getContext();
  let stateId = 0;

	try {
		const view = Counter();
	} handle (effect) {
    if (effect instanceof State) {
			const callingStateId = stateId++;
			let state = context.state[callingStateId];
			if (!state) {
				state = effect.initialValue;
				context.state[callingStateId] = state;
			}
			// Returns the value back and let `Counter` continue to run.
			resume with state;
		} else {
			// ...
		}
	}
}
```

Actually, every built-in hook in React works like that. Although there is no algebraic effect feature in JavaScript, hooks can interact with the execution context with some global variables:

```jsx{3,9}
let currentDispatcher;

function useState() {
  const dispatcher = currentDispatcher;
  // Now you can access the execution context...
}

function render() {
  const context = getContext();
  currentDispatcher = context;

  const view = Counter();

  currentDispatcher = null;
}
```

You may notice that effects can return values. Why is it okay to access the returned value from render functions? Well, it depends on how the effect is handled.

Implementation of `useState` ensures that the state value will only be changed when it’s asked to. Unlike a global variable that you can change it everywhere, `useState` values are protected by React internals. The “key” is the second element returned from `useState`, it’s safe unless you leak it somewhere uncontrollable.

Reminder again, JavaScript has no immutable data structures. You have the responsibility to guarantee that the state object itself will not be changed.

## How about useSignal?

Here is an example to show the usage of `useSignal`:

```jsx
import { useSignal, useComputed } from "@preact/signals-react";

function Counter() {
  const count = useSignal(0);
  const double = useComputed(() => count.value * 2);

  return (
    <button onClick={() => count.value++}>
      Value: {count.value}, value x 2 = {double.value}
    </button>
  );
}
```

Sadly, `useSignal` does not return the value itself. Instead, it returns a “box”, or “ref” that contains the value. Did you remember that we shouldn’t read from refs in render function? So the code here is not as decent as React recommends. It works but it doesn’t mean it’s correct, at least under the theory of React.

## A side note on Preact signal’s problem

Beyond the theories, there are indeed something Preact signal has screwed up. To collect the signal dependencies, the library has to monkey-patch React’s dispatcher object. It observes when React is going to invoke the render function of a component:

```jsx{6}
Object.defineProperty(ReactInternals.ReactCurrentDispatcher, "current", {
  // ...
  set(nextDispatcher: ReactDispatcher) {
    // ...
    if (isEnteringComponentRender(currentDispatcherType, nextDispatcherType)) {
      lock = true;
      const store = usePreactSignalStore(nextDispatcher);
      lock = false;

      setCurrentUpdater(store.updater);
    } else if (
      isExitingComponentRender(currentDispatcherType, nextDispatcherType)
    ) {
      setCurrentUpdater();
    }
  },
});
```

`usePreactSignalStore` will create a signal effect, which will be triggered when the dependency changes. To make sure that there are no memory leaks, effects have to be disposed when they are no longer be used. Certainly the best place to do so is the clean-up callback of `useEffect`.

But the problem is, by the time the signal effect starts collecting dependencies, `useEffect` effects are not committed. It means there are no guarantees that React will ever invoke the clean-up callbacks! In concurrent mode, this problem is likely happening. Voila, memory leaked.

You may have thought that MobX uses the same technique. `useObserver` in mobx-react creates reactions before components are mounted. But it did a better job, it uses finalization registry as a fallback to avoid memory leaks.

# Implementing Signals From Scratch

Ok, enough chatter. Is there a way to implement idiomatic signals in React?

The answer is positive but we do have trade offs. We need to give up the dependency tracking in component level. Derived (computed) signals are still collecting dependencies automatically, but the component must declare its dependencies explicitly.

The reason has been explained earlier in the last section. By the time render function starts to produce the JSX elements, there should be no side effects anymore. You can consider the component an atomic unit, once it’s defined, the dependencies are also determined.

Based on that, we can now implement our signals. I won’t show the complete code here (since dependency tracking is not a secret today), but for completeness sake, here is the type definitions:

```tsx
export interface Observable {
  observe(observer: Action): Disposable;
}

export interface ObservableValue<T> extends Observable {
  get value(): T;
}

export interface Signal<T> extends ObservableValue<T> {
  set value(newValue: T);
}
```

There is something special in our `Observable` type. In addition to automatic dependency tracking, I also introduced an `observe` method to explicitly observe a signal. And later you will see how it can be used.

Then, add the implementation and a convenient factory method:

```tsx
class SignalImpl<T> implements Signal<T> {
  // ...
}

export function signal<T>(value: T): Signal<T> {
  return new SignalImpl(value);
}
```

Using our signal is as easy as any existed library:

```tsx
const counter$ = signal(0);

const dispose = counter$.observe(() => {
  console.log(counter$.value);
});

counter$.value = 42; // Prints "42"
counter$.value += 1; // Prints "43"

// Cancel the observation of the signal.
dispose();
```

## Integration with React

While the signal is independent and framework-agnostic, it should also provide an idiomatic way to be integrated with the frameworks used by apps.

The best way to introduce an external state without hassling the principles of React is `useSyncExternalStore`. It’s a hook to let you read and subscribe to a state that is created outside React components.

To use it, you need to provide two primitive functions: `getSnapshot` and `subscribe`. The `subscribe` function can ensure the dependent component is reactive and always reflect the latest state. For more information on its usage, you can refer to [this doc](https://react.dev/reference/react/useSyncExternalStore).

We want the API to be idiomatic, of course we should provide a hook for use our signals. And the implementation is very concise and intuitive:

```tsx
export function useSignal<T>(signal: ObservableValue<T>): T {
  const subscribe = useCallback(
    (callback: () => void) => {
      return signal.observe(() => {
        callback();
      });
    },
    [signal]
  );
  const getSnapshot = useCallback(() => {
    return signal.value;
  }, [signal]);
  return useSyncExternalStore(subscribe, getSnapshot);
}
```

It’s just a wrapper of `useSyncExternalStore`. The reason we can’t use `useSyncExternalStore` directly is that the hook requires its arguments to be stable. Because there is not a getter function on our signal type, so we have to create one when using `useSyncExternalStore`. Moreover, `this` argument of `observe` function needs to be bound to the signal instance, which also requires a wrapper.

According to the definition of `useSyncExternalStore`, React will re-subscribe to the new value when the passed `subscribe` function changed. Therefore we must memorize those wrapper functions to avoid infinite re-render loop.

That’s it! We’ve just made all things done. 🎉

## Signals in action

A signal is an object representing an independent and atomic value. In real-world, for example, we can use it to build a todo list. The list itself, is just a signal.

```tsx
export type TodoItem = {
  id: number;
  content: string;
};

let globalTodoId = 0;
export function makeTodoItem(content: string): TodoItem {
  const id = ++globalTodoId;
  return { id, content };
}

type TodoItemsSignal = Signal<TodoItem[]>;

export const todo$: TodoItemsSignal = signal([
  makeTodoItem("Read inbox"),
  makeTodoItem("Call Sam to celebrate his birthday"),
  makeTodoItem("Play today's Wordle"),
]);
```

As we discussed earlier, the signal can be used with vanilla JavaScript. You can attach an observer to the signal to react to each change on it. In React, we can use the `useSignal` hook we just implemented:

```tsx{5}
export type TodoListProps = {
  list$: ObservableValue<TodoItem[]>;
};

export function TodoList({ list$ }: TodoListProps) {
  const list = useSignal(list$);

  if (!list.length) {
    return null;
  }

  return (
    <ul className="px-2 py-2">
      {list.map((item) => (
        <li className="flex py-1 gap-4" key={item.id}>
          <p className="flex-1 text-md truncate">{item.content}</p>
        </li>
      ))}
    </ul>
  );
}
```

It’s that simple! If you compare it to Preact Signal, the only thing to add is the `useSignal` hook call. But you make more explicit assertion of which signals your component depends on. And all things happen under React’s principles without compromising the resilience of your components. Sweet!

There is a simple demo to show it in action, [try it here](https://stackblitz.com/edit/idiomatic-react-signals).

## What about update granularity?

The reason we love dependency tracking is that it gives us more granular updates. In Vue, we don’t need to care about what values our components rely on, we just use them. But in React, updates become more explicit. We have to inform React that we want a update now.

When involving a lot of (our) signals in one component, React doesn’t know which signals the component currently needs. The component will be updated every time a signal changed, even if it doesn’t need that signal at the time. It’s natural because React doesn’t allow us to call hooks inside conditions and loops. It means signal dependencies is determined and fixed when the component is created.

But… do you really need to encapsulate all signals in one component?

Let’s take a look at this example:

```tsx
function BadComponent({ foo$, bar$ }) {
  const foo = useSignal(foo$);
  const bar = useSignal(bar$);

  return (
    <div>
      <p>{foo.title}</p>
      {foo.expanded ? (
        <div className="sub-panel">
          <p>{bar.title}</p>
          <p>{bar.value}</p>
        </div>
      ) : null}
    </div>
  );
}
```

It’s a very common scenario, in which one dynamic part is controlled by another state. The element with `sub-panel` class is dynamic and reflecting the data of `bar`, and its visibility is controlled by `foo`. When `foo.expanded` is true, it looks fine. But once `foo.expanded` is set to false, unnecessary updates will appear. The component doesn’t need `bar` signal anymore, but it’s still updated when `bar` changes.

How can we make updates granular? The answer is splitting. We can move the inner part into another component:

```tsx
function InnerComponent({ bar$ }) {
  const bar = useSignal(bar$);

  return (
    <div className="sub-panel">
      <p>{bar.title}</p>
      <p>{bar.value}</p>
    </div>
  );
}

function GoodComponent({ foo$, bar$ }) {
  const foo = useSignal(foo$);

  return (
    <div>
      <p>{foo.title}</p>
      {foo.expanded ? <InnerComponent bar$={bar$} /> : null}
    </div>
  );
}
```

Now, our components are more concise, both of them rely on a minimal set of signals. The outer component still receives `bar$` signal, but the component is not reactive to it, and just pass it down to the inner component. When `foo.expanded` is set to false, `InnerComponent` is unmounted, and its signal subscription is gone. Similarly, when `foo` changes, `InnerComponent` will not be updated, because these two signals are just not relevant!

You can continue to optimize your component by using `memo`, which eliminates unnecessary re-renders when there are no props changed. And I’d like to recommend you to read [Before You memo()](https://overreacted.io/before-you-memo/) to learn more about it.

As a comparison with classic state hoisting, you can see our solution has also fixed the [“Prop Drilling”](https://www.builder.io/blog/usesignal-is-the-future-of-web-frameworks#prop-drilling) issue! Of course, that is signal’s credit. Now we have it in React with a right approach.

# Wrap-up

It seems that we discussed about React principles dogmatically in this article. But we may have already ignored lots of them when building real projects. React is hard, full of pitfalls, and error-prone. So we must be very careful about them, and most importantly, we must know the mechanism. Understanding how things work behind the scene helps us to avoid mistakes beforehand.

People like to bring exotic features they like to a framework, which may improve DX. But we should also use them with caution, especially when they are done with tricks. When you start considering using tricks, you may have headed into the wrong direction.

There is a trade-off between resilience and convenience, but you can always find a better options.
