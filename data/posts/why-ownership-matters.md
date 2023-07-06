---
title: Why Ownership Matters
tag: ProgrammingLanguage
description: A missing feature in system programming.
date: "2023-06-07T05:15:20.114Z"
---

WWDC 2023 introduced Swift 5.9, which brings a lot of new features. While macro is the most exciting thing, ownership doesn’t seem to have drawn much attention.

However, I think it’s one of the most important feature evolved over the years. Swift is now more expressive and more precise with it. Let’s explore.

## Value Types

Before discussing ownership, let’s first talk about value types.

Swift has two kinds of types: **reference types**, and **value types**.

Reference types are reference-counted, heap-allocated objects. They have reference semantics when passed between functions. And typically, they can manage their underlying resources with `init` and `deinit` methods. When you write code like this:

```swift
class Foo {
  // ...
}

let x = Foo()
let y = x
```

It creates a new reference to `x`, and no new objects are created.

Value types on the other hand, are just independent values. Before Swift 5.9, value types are copied when assigned to new variables. The same code above copies the value of `x` to `y`, and they literally represent different things.

Languages like C++ and Rust only have value types, but you can implement your own reference types via RAII.

## Trivial Types

In C++, there is a concept called trivial class. A trivial class has trivial [copy](https://en.cppreference.com/w/cpp/language/copy_constructor#Trivial_copy_constructor) & [move](https://en.cppreference.com/w/cpp/language/move_constructor#Trivial_move_constructor) constructor, and [trivial destructor](https://en.cppreference.com/w/cpp/language/destructor#Trivial_destructor), which means they can’t be user-defined.

Before Swift 5.9, all value types are like trivial types. When they are copied, their memory bytes are simply copied to the new locations. But the difference is, additional value witness functions may be executed to maintain the lifetime of the reference-type members (this is not how trivial types defined in C++, but we don’t have control).

Value types in Swift can’t implement RAII because they are trivial. And this is also how value types are designed in Swift. Value types like `CGRect`, `Date`, and `Character` all represent values, not resources. And we don’t need to worry about how to release their underlying resources, because they just don’t allocate resources manually.

Reference-type members in value types are specially handled, and it’s also automatically done by compiler. Value type like `String` actually requires extra heap buffer to store its variable-length contents, and the buffer has to be a class (reference type) to be managed properly.

## A Common Problem

Reference types are good, you can allocate your own resources and Swift takes care of them by automatic reference counting. But they also have downsides: everything needs to be heap-allocated. In performance-sensitive scenarios, massive allocation of reference-type values can be unaffordable.

Let’s see a real-world example:

```swift
struct FileDescriptor {
  let fd: Int

  init?(filePath: String) {
    guard let fd = try? openFile(at: filePath) else {
      return nil
    }
    self.fd = fd
  }

  func write(_ data: Data) {
    // ...
  }

  func close() {
    // ...
  }
}
```

The resource a file descriptor holds is just an integer. We definitely don’t want to use class just for automatic resource management. However, using structs means the resource can be leaked if we forget to call `close` method. Even worse, if the value is copied, we totally lose control of it:

```swift
let handleToFileA = try! FileDescriptor(filePath: "/path/to/a")

let anotherHandleToFileA = handleToFileA
anotherHandleToFileA.close()

handleToFileA.write(...) // 💥 BOOM!
```

In the end, we have to avoid using structs to represent a file descriptor. What a sad story.

## Rust to the Rescue

When it comes to Rust, you will find everything works just like a charm. Why?

First, value types don’t have to be trivial types, and they can have custom destructors:

```rust
impl Drop for OwnedFd {
    #[inline]
    fn drop(&mut self) {
        unsafe {
            let _ = libc::close(self.fd);
        }
    }
}
```

Second, all user-defined types are not copyable by default. They are moved when assigned:

```rust
let handle_to_file_a = acquire_fd();

let another_handle_to_file_a = handle_to_file_a; // note: value moved here
drop(another_handle_to_file_a);

let _ = handle_to_file_a.is_terminal(); // error: borrow of moved value: `handle_to_file_a`
```

Third, lifetimes are checked at compile-time. As the above code shows, using a moved value will result in an error.

While all types are value types in Rust, they can still be divided into 3 categories:

1. **“POD” type:** such types can be bit-wise copied, and they implement `Copy` trait. Instead of being moved, they are copied implicitly when assigned. Examples are `i32`, `Duration`, etc.
2. **Duplicatable type:** they implement `Clone` trait and can be cloned explicitly. After cloned, the new value may refer to the same thing or another different thing, depends on the semantics of the type. Examples are `String`, `Arc`, etc.
3. **Exclusive type:** they can’t be copied, nor can it be cloned. Examples are `File`, `Box<T>` (where `T` is not `Clone`), etc.

These can cover almost all the cases we may meet, and the soundness is guaranteed by the compiler.

Another good thing of Rust is that it uses move semantics by default. With some rare exceptions (such as self-referential types), move semantics don’t make mistakes. You can progressively adopt `Copy` and `Clone` when you find it’s safe to do so.

All of these rules make up the unique feature of Rust: **[ownership](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html)**.

## Ownership in Swift

Swift 5.9 introduced **[non-copyable types](https://github.com/apple/swift-evolution/blob/main/proposals/0390-noncopyable-structs-and-enums.md)**, which imply unique ownership. Value types that represent underlying resources are suitable to be non-copyable. By using it, developers can no longer copy a file descriptor by mistake. And since the ownership is unique, it’s also safe to release resources when the value goes out of scope, which enables you to add `deinit` to non-copyable structs / enums.

To make a type non-copyable, simply add `~Copyable` suppression annotation:

```swift
struct FileDescriptor: ~Copyable {
  // ...

  consuming func close() {
    // ...
  }
}
```

The `consuming` modifier makes `close` method move the receiver. Now the code below becomes invalid:

```swift
let handleToFileA = try! FileDescriptor(filePath: "/path/to/a")

let anotherHandleToFileA = handleToFileA
anotherHandleToFileA.close()

handleToFileA.write(...) // error: 'handleToFileA' used after consume
```

Assigning a variable of non-copyable type to another will be move assignment. But sometimes you need to use a value but don’t want to move it. It’s where borrow comes into the play. By marking a function or parameter `borrowing`, you can borrow it without consuming it:

```swift
struct FileDescriptor: ~Copyable {
  // ...

  borrowing func write(_ data: Data) {
    // ...
  }
}

// It's ok to do this multiple times:
handleToFileA.write(...)
handleToFileA.write(...)
handleToFileA.write(...)
```

Actually you don’t need an explicit `close` method, as non-copyable types support the RAII technique. You can just release your resources in `deinit`:

```swift
struct FileDescriptor: ~Copyable {
  // ...

  deinit {
    // Called when the file descriptor leaves the scope.
    // ...
  }
}
```

Other functions that consume non-copyable values also take the ownership of them:

```swift
func flushAndClose(_ fd: consuming FileDescriptor) {
  // ...

  // `deinit` of `fd` is called here.
}
```

And it’s not allowed to consume a borrowed value:

```swift
func appendSomething(to fd: borrowing FileDescriptor) {
  flushAndClose(fd) // error: 'fd' has guaranteed ownership but was consumed
}
```

## Closing up

Ownership is a really great feature that enables us to write memory-safe code, while not introducing additional overheads. It’s a kind of zero-cost abstraction, which is very necessary for system programming. Although Swift doesn’t have mandatory adoption requirement of ownership, you should still be aware of it and take advantage of it as much as possible.
