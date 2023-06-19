---
title: 为什么所有权很重要
tag: ProgrammingLanguage
description: 一个在系统编程中被期待已久的特性。
date: "2023-06-07T05:15:20.114Z"
---

WWDC 2023 中发布了 Swift 5.9，带来了许多新特性。大家都普遍对宏非常感兴趣，然而所有权的特性并没有引起很多关注。不过我认为这是 Swift 迭代多年以来的一个非常重要的特性，有了这个特性之后 Swift 将更具表达力，对代码有更准确的控制。

让我们来一起探索一下。

## 值类型

在讨论什么是所有权之前，我们先来说说值类型。

Swift 有两种类型：**引用类型**和**值类型**。

引用类型采用了引用计数来维护它的生命周期，并且是分配在堆内存的。它们在函数间传递时也采用了引用语义。通常来说，你可以在其中维护一些底层资源，并且在 `init` 和 `deinit` 方法中管理它们。比如当你写出下面这样的代码时：

```swift
class Foo {
  // ...
}

let x = Foo()
let y = x
```

它会创建一个指向 `x` 的新引用，但没有新的对象被创建。

但值类型的每个变量却是独立的值，在 Swift 5.9 之前的版本，它们会在赋值的时候发生拷贝。比如上面相同的代码，`x` 的内容会被拷贝到 `y`，它们表示的就会是不同的东西了。

像 C++ 和 Rust 这样的语言只有值类型，但你可以通过 RAII 等特性自己实现引用类型。

## 平凡类型

在 C++ 中有一个概念叫做平凡类型，它们需要具有[平凡复制](https://en.cppreference.com/w/cpp/language/copy_constructor#Trivial_copy_constructor)、[平凡移动](https://en.cppreference.com/w/cpp/language/move_constructor#Trivial_move_constructor) 构造函数，以及[平凡析构函数](https://en.cppreference.com/w/cpp/language/destructor#Trivial_destructor)。也就是说它们不可以是用户定义的。

在 Swift 5.9 之前，所有的值类型都是平凡类型。当你拷贝它们时，它们的内存字节会被直接拷贝到新的位置，不会有其他事情发生。不过有一点不同的是，value witness 函数可能会被执行，所以结构体里的引用类型成员的引用计数会被增加（不过这也不是我们可以控制的行为）。

由于 Swift 中的值类型都是平凡类型，所以它们不能用来实现 RAII，并且也是设计如此的。
像 `CGRect`、`Date` 和 `Character` 这些类型，它们都是表示值的，而不是资源。我们也不需要关心如何释放它们所管理的资源，毕竟它们根本不会手动申请任何资源。

值类型中的引用类型成员是被特殊处理的，编译器会保证它们会被正确释放。比如 `String` 底层会有额外的堆内存 buffer 来存储可变长度的内容，这些 buffer 都是类实现的，因此也可以通过引用计数来正确管理。

## 一个常见的问题

引用类型很棒，你可以分配管理你自己的资源，Swift 也可以在合适的时机释放它们。但引用类型也有缺点：所有的对象都是分配在堆上的，在一些性能敏感的场景，大量的堆内存分配会带来严重的开销。

让我们来看一个实际的例子：

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

`FileDescriptor` 所持有的资源并不仅仅是一个整数值，我们也绝对不希望为了引用计数的资源管理而引入堆内存分配。然而使用 struct 意味着你需要手动处理资源的释放问题，更糟糕的是，如果你拷贝了这个值，我们对资源就完全失去控制了：

```swift
let handleToFileA = try! FileDescriptor(filePath: "/path/to/a")

let anotherHandleToFileA = handleToFileA
anotherHandleToFileA.close()

handleToFileA.write(...) // 💥 BOOM!
```

如此来看，struct 管理这类资源是完全不现实的了。

## Rust 是如何解决这个问题的

我们会发现，其实换成 Rust 之后问题就迎刃而解了。为什么呢？

首先，Rust 的值类型不一定要是平凡类型，它们可以有自己的析构函数：

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

其次，所有用户定义的类型默认都是不可拷贝的，它们在赋值时只能被移动：

```rust
let handle_to_file_a = acquire_fd();

let another_handle_to_file_a = handle_to_file_a; // note: value moved here
drop(another_handle_to_file_a);

let _ = handle_to_file_a.is_terminal(); // error: borrow of moved value: `handle_to_file_a`
```

最后，编译器会在编译时检查变量的生命周期。就像上面的代码所示，如果你使用了一个被移动过的变量，它会在编译时产生错误。

虽然 Rust 中所有的类型都是值类型，我们仍然可以把它们分为 3 类：

1. **平凡类型：** 这类类型可以按位拷贝，它们实现了 `Copy` 这个 trait。赋值时，它们会被隐式拷贝，而不是被移动。例子有 `i32`、`Duration` 等。
2. **可复制类型：** 它们实现了 `Clone` trait，从而可以被显式地复制。复制之后，新的值可能表示同一个东西，也可能表示另外一个完全不同的东西，这取决于类型的语义。例子有 `String`、`Arc` 等。
3. **独占类型：** 它们不可以被拷贝或者复制。例如 `File`、`Box<T>` (当 `T` 没有实现 `Clone` 时) 等。

这些几乎覆盖了所有可能遇到的情况，soundness 也是能被编译器保证的。

Rust 另外一个非常好的点是所有的值默认都是移动语义的。除了一些罕见的场景（比如自引用类型），使用移动语义不会让你犯错误。在你认为安全且必要时，你可以逐步添加对 `Copy` 和 `Clone` 的支持。

所有这些规则组成了 Rust 这个独特的特性：**[所有权](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html)**。

## Swift 中的所有权

Swift 5.9 引入了「**[不可拷贝类型](https://github.com/apple/swift-evolution/blob/main/proposals/0390-noncopyable-structs-and-enums.md)**」，同时隐含了独占所有权的概念。表示底层资源的值类型适合被标记为不可拷贝，这样我们就能防止不经意地拷贝上面说的 `FileDescriptor` 了。并且因为它的所有权是独占的，在变量退出作用域时也可以被安全地释放掉。因此你可以为这类值类型添加 `deinit` 方法。

要让一个类型是不可拷贝的，只需要添加一个 `~Copyable` 标记即可：

```swift
struct FileDescriptor: ~Copyable {
  // ...

  consuming func close() {
    // ...
  }
}
```

`consuming` 修饰符会使 `close` 方法消费（移动）掉这个对象。这样，下面的代码就是无效的了：

```swift
let handleToFileA = try! FileDescriptor(filePath: "/path/to/a")

let anotherHandleToFileA = handleToFileA
anotherHandleToFileA.close()

handleToFileA.write(...) // error: 'handleToFileA' used after consume
```

将一个不可拷贝类型的变量赋给另一个变量时，值会发生移动。但有时你可能不想直接消费掉这个对象，只是想暂时使用一下。这就需要用到“借用”了，可以通过将一个方法标记为 `borrowing` 来实现：

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

实际上你并不需要显式的 `close` 方法，不可拷贝类型由于有 `deinit` 方法，你可以直接在那里释放资源，从而实现类似 RAII 的效果：

```swift
struct FileDescriptor: ~Copyable {
  // ...

  deinit {
    // Called when the file descriptor leaves the scope.
    // ...
  }
}
```

方法如果有 `consuming` 的参数，同样也会取走这个变量的所有权：

```swift
func flushAndClose(_ fd: consuming FileDescriptor) {
  // ...

  // `deinit` of `fd` is called here.
}
```

你不能够取走借用变量的所有权：

```swift
func appendSomething(to fd: borrowing FileDescriptor) {
  flushAndClose(fd) // error: 'fd' has guaranteed ownership but was consumed
}
```

## 总结

所有权是一个非常棒的特性，它能够让我们写出更加内存安全的代码，同时又不需要引入额外的开销。我们称这类特性为零开销抽象，它们在系统编程中至关重要。尽管 Swift 没有强制要求我们使用所有权特性，但我们仍然应该了解它，并尽可能利用它写出更好的代码。
