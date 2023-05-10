---
title: Thoughts on React Server Components
tag: React
description: The old-new-thing.
date: "2023-04-26T12:00:00.000Z"
---

As **React Server Components (RSC)** being actively discussed recently, I would like to share some of my thoughts on this interesting feature. After some researches and getting hands-on, I found that RSC is one of the most important milestones for React. It once again broke the boundaries between client-side and server-side, expanding the possibilities of what we can do.

> **Note:**
>
> This post is based on this [demo](https://github.com/reactjs/server-components-demo/tree/99e49cbb37a6e73aaa0d0751d7cee9217c263c26). The feature is still at an early stage, and things may have changed when you read this.

# Background

Before talking about what RSC is, I’d like to recap the real-world problem that [this video](https://youtu.be/TQQPAU21ZUw) talked about.

Let’s imagine that we are implementing an artist page in Spotify. It consists of three parts: song details, top tracks and discography. The code may look like this:

```jsx
function ArtistPage({ artistId }) {
  return (
    <ArtistDetails artistId={artistId}>
      <TopTracks artistId={artistId} />
      <Discography artistId={artistId} />
    </ArtistDetails>
  );
}
```

It’s very straightforward, but there is an obvious issue: How do these components fetch the data they need?

One approach is to fetch them all together in the top-level component:

```jsx{1}
function ArtistPage({ artistId }) {
  const stuff = fetchAllTheStuff(artistId);
  return (
    <ArtistDetails details={stuff.details}>
      <TopTracks topTracks={stuff.topTracks} />
      <Discography discography={stuff.discography} />
    </ArtistDetails>
  );
}
```

This is possible thanks to the technologies like GraphQL, but that’s another story. I want to focus on a new issue it addressed. We fetch all the data that child components need, but we can easily forget to update the API endpoint when we update these components in subsequent iterations.

So in the end, we may have to fallback to a stupid-but-simple way:

```jsx
function ArtistDetails({ artistId }) {
  const details = fetchDetails(artistId);
  // ...
}

function TopTracks({ artistId }) {
  const topTracks = fetchTopTracks(artistId);
  // ...
}

function Discography({ artistId }) {
  const discography = fetchDiscography(artistId);
  // ...
}
```

Each of the child component only fetches the data it need independently. The requests and responses go back and forth, and users will see the contents rendered one after another, making a poor user experience.

Is there a way to solve the problem? Yes, RSC is just the magic pill!

# Prior Art

## **Relay + GraphQL**

Back to the first solution mentioned above, if we can collect the data dependencies of each component, the problem is solved.

This can be done with **[Relay](https://relay.dev/)**, which is built for GraphQL-based apps that scale. It tracks the data dependencies by small GraphQL fragments, and requests them atomically in a top level provider component. It’s great in Facebook, but not all companies are willing or able to adopt it.

## SSR / SSG

So hasn’t SSR already solved the problem?

No. It indeed solves the data fetching problem, but it’s not working with interactive contents. The page rendered with SSR is a complete plain HTML string. But when you make changes on the page (like switching a toggle, search for something, etc.), you have to go back to client-side data fetching. Or you can request the page with these queries, and once again, the server gives you a new complete HTML. Apparently, it brings worse user experience, since the state is lost when you reloading the whole page.

SSR is great for SEO, and can make a better first-frame loading experience. But it’s absolutely bad for interactions.

## PHP

Same as SSR. It renders the whole page when users interact.

## [ASP.NET](http://ASP.NET) with Blazor

Perhaps Microsoft is just forgotten by everyone, but the technology it developed is actually the embryo of RSC. Blazor is a framework that compiles C# to client-side code, and shares some logic with server-side. When user interacts with the page, it sends the browser event to the server, and server will respond with the updates to the page.

Remember this, and notice the main differences between it and RSC.

# What’s RSC?

Now, let’s talk about RSC. What is it?

It’s a kind of components that…

- **Run only on server**, the code is never downloaded to clients (reducing the bundle sizes).
- **Have full access to the server resources**, because it’s running on the server side, it can be coupled with some server code to process the data.
- **Can render client components**, like other client components (we are already using), it can make client download the code on-demand for the components it renders.

## A First Look at RSC

Just like the client components you are already familiar with, server components have nothing special:

```jsx
export default function App({ selectedId, isEditing, searchText }) {
  return (
    <div className="main">
      <section className="col sidebar">
        <section className="sidebar-header">
          <strong>React Notes</strong>
        </section>
        <section className="sidebar-menu" role="menubar">
          <SearchField />
          <EditButton noteId={null}>New</EditButton>
        </section>
        <nav>
          <Suspense fallback={<NoteListSkeleton />}>
            <NoteList searchText={searchText} />
          </Suspense>
        </nav>
      </section>
      <section key={selectedId} className="col note-viewer">
        <Suspense fallback={<NoteSkeleton isEditing={isEditing} />}>
          <Note selectedId={selectedId} isEditing={isEditing} />
        </Suspense>
      </section>
    </div>
  );
}
```

In this example, the server component renders HTML elements, client components and other server components.

When rendering server components, the code runs directly on the server side:

```jsx{4,5,6,7}
export default async function NoteList({ searchText }) {
  // You can access DB, cache and all the stuffs that only
  // the server code can.
  const notes = (
    await db.query(
      `select * from notes where title ilike $1 order by id desc`,
      ["%" + searchText + "%"]
    )
  ).rows;

  return notes.length > 0 ? (
    <ul className="notes-list">
      {notes.map((note) => (
        <li key={note.id}>
          <SidebarNote note={note} />
        </li>
      ))}
    </ul>
  ) : (
    <div className="notes-empty">
      {searchText
        ? `Couldn't find any notes titled "${searchText}".`
        : "No notes created yet!"}{" "}
    </div>
  );
}
```

The server will stop at the HTML elements and client components. Let’s say `SidebarNote` is a client component, the server will return the data (`note` property) it needs in the final response, so that React can use it to render `SidebarNote` component on the browser.

That’s it, pretty easy to understand.

## How to Update

So far, we haven’t covered the part of updates. So how does it work with RSC? Here is an example:

```jsx{17,18,19}
export default function SearchField({ placeholder }) {
  const [text, setText] = useState("");
  const [isSearching, startSearching] = useTransition();
  const { navigate } = useRouter();
  return (
    <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
      <label className="offscreen" htmlFor="sidebar-search-input">
        Search for a note by title
      </label>
      <input
        id="sidebar-search-input"
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          const newText = e.target.value;
          setText(newText);
          startSearching(() => {
            navigate({
              searchText: newText,
            });
          });
        }}
      />
      <Spinner active={isSearching} />
    </form>
  );
}
```

Currently, developers can only put interactions in client components. And `SearchField` is a client component. You can use hooks like `useState`, `useEffect` and optionally `useCallback` to implement your interactions. But the only way (as I can tell) to trigger an update is to change the navigation queries. With `useRouter` hook, we can get a `navigate` function, and later we can invoke it when user makes some changes.

Here we pass the `newText` to the query part of the page location. The router refetches the whole V-DOM with a single API request:

```jsx{9,10,11}
export function Router() {
  // ...
  const [location, setLocation] = useState({
    selectedId: null,
    isEditing: false,
    searchText: "",
  });

  // ...
  content = createFromFetch(
    fetch("/react?location=" + encodeURIComponent(locationKey))
  );

  function navigate(nextLocation) {
    startTransition(() => {
      setLocation((loc) => ({
        ...loc,
        ...nextLocation,
      }));
    });
  }

  return (
    <RouterContext.Provider value={{ location, navigate, refresh }}>
      {use(content)}
    </RouterContext.Provider>
  );
}
```

It utilized **Suspense** to coordinate the view state with promise values, supporting loading state, fallbacks, etc.

## Restrictions

RSCs have some restrictions, it **cannot**…

- **Have interactions**, all interactions (like timers, UI event handling) must and only can happen in client components.
- **Be rendered by client components.** App’s root component must be an RSC to use RSC, because client components cannot render RSC. But you can pass an RSC to client components as children. It’s called 🍩 pattern by React team, because client components are not aware of the existence of RSCs, they just render what they received.

# Dive Deeper

The above sections describe **RSC** from a developer’s perspective. Now, let’s take a look at the underlying implementations.

As a entry point, we will start with the `Router` component. This is an exceptional client component that renders RSC. Just for refreshing your memory, please scroll up a bit to take a look at the code of `Router` component. The core thing is `createFromFetch` function.

Before digging into it, let’s first look at the network requests it initiates:

```jsx
// GET http://localhost:4000/react
// Query: location: {"selectedId":null,"isEditing":false,"searchText":"hello"}

1:I{"id":"./src/SearchField.js","chunks":["client2"],"name":""}
2:I{"id":"./src/EditButton.js","chunks":["client0"],"name":""}
3:"$Sreact.suspense"
0:["$","div",null,{"className":"main","children":[/* ... */]}]
4:["$","div",null,{"className":"notes-empty","children":["Couldn't find any notes titled \"hello\"."," "]}]
5:["$","div",null,{"className":"note--empty-state","children":["$","span",null,{"className":"note-text--empty-state","children":"Click a note on the left to view something! 🥺"}]}]
```

The response has a special protocol that contains a sequence of data that client need. All server components are erased to untyped element tree and being lazily referenced in the response. And it also provides the hints of module that the client needs to fetch for rendering corresponding client components.

The function that processes this data looks like:

```jsx{19}
function processFullRow(response, row) {
  if (row === "") {
    return;
  }

  var colon = row.indexOf(":", 0);
  var id = parseInt(row.substring(0, colon), 16);
  var tag = row[colon + 1];

  switch (tag) {
    case "I": {
      resolveModule(response, id, row.substring(colon + 2));
      return;
    }
    case "E": {
      // ...
    }
    default: {
      // We assume anything else is JSON.
      resolveModel(response, id, row.substring(colon + 1));
      return;
    }
  }
}
```

The conversion from server response to element tree happens in `resolveModel` function, the whole process is complex and I don’t want to delve into it here. Let me just explain it very quickly. For this server component:

```jsx
export default function App({ ... }) {
  return (
    <div className="main">
      <section className="sidebar-menu" role="menubar">
        <SearchField placeholder={"Search"} />
        <EditButton noteId={null}>New</EditButton>
      </section>
      <nav>
        <Suspense fallback={<NoteListSkeleton />}>
          <NoteList searchText={searchText} />
        </Suspense>
      </nav>
    </div>
  );
}
```

`SearchField` and `EditButton` are client components, but they are code-splitted into independent chunks. They are represented by `$Lx` placeholder and later will be parsed as a lazy component by JSON replacer:

```jsx
function parseModelString(response, parentObject, key, value) {
  if (value[0] === "$") {
    if (value === "$") {
      // A very common symbol.
      return REACT_ELEMENT_TYPE;
    }

    switch (value[1]) {
      // ...
      case "L": {
        // Lazy node
        var id = parseInt(value.substring(2), 16);
        var chunk = getChunk(response, id); // We create a React.lazy wrapper around any lazy values.
        // When passed into React, we'll know how to suspend on this.

        return createLazyChunkWrapper(chunk);
      }
      // ...
    }
  }
  // ...
}
```

These lazy components are finally rendered with Suspense. In this way, RSCs can streaming contents as loading, without blocking the whole page.

The `NoteList` is an RSC, it will turn to a plain V-DOM element tree which can contain other client components (also lazily referenced).

# Observations

## Downsides I Can See

**RSC** looks great, but I see some limitations on it. The first and most important one is: it has a hard adoption strategy. Due to the current restrictions, client components in your existed apps cannot render server components. **You must start with modifying the root**! It may be impossible for some apps.

Secondly, RSCs cannot have interactions, which means actions that cause data refetching must happen in client components. And the only way to refetch data is navigating through the router, it’s likely to make your routing query messy when your app scales.

Finally, RSCs are still not incrementally updated. The server receives the complete request query and returns the complete element tree. Well yes, the reconciliation process can preserve the state on client side, but network traffic can be heavy when your page contains a lot of contents. It will cause performance issues when you need to frequently update a small portion of your page.

## Improvements Can Be Made

### Client components to render server components

IMO, client components should be able to render server components. Addition to putting the query on routes, we can also use server components with props:

```jsx
function Example({ postId }) {
  return <MyServerComponent postId={postId} />;
}
```

At compile time, `MyServerComponent` is turned into a lazy component and request its data with the same way as it does now.

However, this is a thing that should be avoided when possible, because it brings back client-server waterfalls (which is exactly what RSC is trying to solve). Even though, the flexibility should be provided for smooth transition of existing apps and handling corner cases. Just like SwiftUI is providing `ViewPresentable` views for compatibility concerns.

### Incremental updates and interactions

As for incremental updates and interactions, we can borrow the ideas from **Redux**. For example, we have the server component below:

```jsx
function Counter({ step }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    alert("count changed!");
  }, [count]);
  return (
    <div>
      <button onClick={() => setCount((prev) => prev + step)}>Inc</button>
      <span>{count}</span>
      <button onClick={() => setCount((prev) => prev - step)}>Dec</button>
    </div>
  );
}
```

To update the component incrementally, we need to request the server with **an action**. It consists of:

- **The action.** In the example above, the only action is `setCount` calls. So the action identifier and arguments are required to be uploaded to the server.
- **Props and state.** Since servers are more likely to be stateless, they don’t know what a component looks like before. As a context, these also need to be uploaded.

The server should respond with a sequence of effects, including: DOM changes, props updates of child client components, other side-effects (not possible without downloading the code?).

As I mentioned earlier in **“Prior Art”** section, Blazor has had incremental updates and interactions already. It would be fun to explore how it is implemented in the future.

### Opt-out

We should be able to opt-out server-side rendering in some scenarios. For example, we have a server component that has complex business logic (like Markdown parsing), we want to split the code out of the bundle while maintaining the first-time loading performance. The component can be rendered on server side for the first time it’s used, and subsequence renders should be fully on client side for less traffic in further requests.

# Wrap-up

Although RSC is still in its very early stages, it’s indeed an important step forward for React.

The web development evolves so rapidly. From fully server rendering (with JSP, PHP, etc.) to rich client-side apps (AJAX and the growth of JavaScript), we got much better user experience and saw what a browser can do. From fully client-side rendering to server-side rendering (Next.js, BFF, etc.), we got better SEO and first-frame loading performance. These are the old-new-things that really change how we develop and use the Web.

I'm very excited about what possibilities RSC can bring us. Thanks for the hard work of React team to make this happen!

# References

1. [RFC: React Server Components](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
2. [React Server Components Demo](https://github.com/reactjs/server-components-demo/)
3. [Introducing Zero-Bundle-Size React Server Components](https://reactjs.org/server-components)
4. [https://twitter.com/dan_abramov](https://twitter.com/dan_abramov)
