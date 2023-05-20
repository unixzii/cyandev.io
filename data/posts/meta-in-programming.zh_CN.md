---
title: 编程中的“元”
tag: Misc
description: 由几个编程相关的例子做出的简明解释。
date: "2023-05-20T08:53:23.640Z"
---

带有“meta”前缀的词在编程中无处不在。一些常见的例子包括“元数据”、“元编程”和“元类”。那么它们实际上意味着什么呢？

## 词汇定义

> **met·a** _(adj.)_
>
> 指向自身或其类型的惯例；自我引用。

简单地说，“meta-X”就是关于 X 的 X。

## 示例

### 元数据

这是最简单的一个词，我们可以在各种地方找到它的身影。根据上述定义，**元数据**是关于数据的数据。它本身就是一种数据，然后描述的又是数据。

例如，这篇文章的元数据是：

```yaml
title: 编程中的“元”
tag: Misc
description: 由几个编程相关的例子做出的简明解释。
date: "2023-05-20T08:53:23.640Z"
```

你看，这是一条数据。而它描述的则是另一条数据：这篇文章。

### 元框架

如果你是 Web 开发者，那么你一定听说过“**元框架**”这个词。假设我们认为 React 是一个框架（这里先不讨论它到底是不是框架），那么 Next.js 就是它的元框架。当然，也有很多适用于其他场景的元框架。这里有一篇文章供你深入研究：[Unraveling the JavaScript Meta-framework Ecosystem](https://prismic.io/blog/javascript-meta-frameworks-ecosystem)。

### 元编程

对于很多人来说，这可能听起来有点吓人，他们认为**元编程**是魔法。实际上，它相当简单，只是编程的另一种形式。

在一些编程语言中，元编程可能很困难，因为这些语言中没有为它设计的特殊特性。例如，如果你想在 C++ 中实现一个编译时的多态方法，并且你想实现一些复杂的重载规则。那有意思了，你需要了解一个叫做 **[SFINAE](https://en.wikipedia.org/wiki/Substitution_failure_is_not_an_error)**（“替代失败不是错误”的缩写）的东西。对于初学者来说，这可能看起来很困难。

但在一些编程语言中，元编程可以非常容易。假设我们想让一个类型提供一个返回其类型名称的方法。在 Rust 中，你可以使用一种叫做 **[过程宏](https://doc.rust-lang.org/reference/procedural-macros.html#procedural-macros)** 的东西。

首先，定义一个叫 Describe 的 trait：

```rust
trait Describe {
    fn type_name(&self) -> &'static str;
}
```

然后，创建一个 derive 过程宏：

```rust
#[proc_macro_derive(Describe)]
pub fn derive_describe_macro(item: TokenStream) -> TokenStream {
    let item = parse_macro_input!(item as Item);
    let ident = match item {
        Item::Enum(enum_item) => enum_item.ident,
        Item::Struct(struct_item) => struct_item.ident,
        _ => todo!("emit compile_error!()"),
    };
    let ident_str = ident.to_string();

    quote! {
        impl Describe for #ident {
            fn type_name(&self) -> &'static str {
                #ident_str
            }
        }
    }.into()
}
```

这就是一段普通的 Rust 代码，它操作了另一段 Rust 代码。通过它，你可以使用很多强大的编译器能力来自动生成代码。

然后你可以像这样使用它：

```rust
#[derive(Describe)]
struct Foo {
    bar: i32,
    baz: bool
}

#[test]
fn test_describe() {
    let foo = Foo { bar: 42, baz: true };
    assert_eq!(foo.type_name(), "Foo");
}
```

### 元类

一些编程语言有**元类**的概念。通常，这些语言的类都是一等公民。

有点晕了？

一等公民的类意味着语言中的类就像其他类型一样。数字、字符串和类，它们都可以被存储在一个变量中。

在 Ruby 中，对象的实例方法是定义在它们的类上的。当你调用 `foo.bar()` 时，Ruby VM 将在 `foo` 的类上搜索 `bar` 方法。但是如果我们想要声明一个类方法该怎么办呢？

在其他类不是一等公民的编程语言中（如 C++、Java 以及 Swift 等），类会被编译器特殊处理。实例方法和类方法只是类的不同特性，在方法派发上不需要遵循统一的模式。

而对于 Ruby 而言，无论 `x` 是一个对象还是一个类，当你执行 `x.y()` 时，VM 都会遵循相同的模式来派发这个调用。基于这个思想，你就应该很清楚怎么声明类方法了。为了避免语法糖的干扰，我这里使用 `define_method` 来演示，它与 `def` 语法效果相当：

```ruby
class Foo
end

Foo.define_method(:bar) {
  puts self
}

Foo.singleton_class.define_method(:baz) {
  puts self
}

foo = Foo.new
foo.bar  # Prints "#<Foo:0x0000000135062b70>"
Foo.baz  # Prints "Foo"
```

通过访问 `singleton_class` 属性，你可以获取 `Foo` 的元类并在它上面定义方法。我这里不会深入探讨 `singleton_class` 和 `class` 之间的区别，但对于解释元类是什么已经足够了。当然，如果你感兴趣的话也可以深入研究一下，Ruby 对象系统的设计还是挺有意思的。

## 总结

我们在这篇文章中举了一些例子，但这并不能涵盖所有类似的词汇。但通过这些例子，我想你应该对“元”到底是什么有了一个大致的了解。希望这对你有所帮助。
