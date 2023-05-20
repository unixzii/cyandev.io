---
title: “Meta-” in Programming
tag: Misc
description: From programming, beyond programming.
date: "2023-05-20T08:53:23.640Z"
---

Words with prefix “meta” is ubiquitous in programming. Some common examples are “metadata”, “metaprogramming”, and “metaclass”. So what do they actually mean?

## Word Definition

> **met·a** _(adj.)_
>
> referring to itself or to the conventions of its genre; self-referential.

Simply put, “meta-X” is an X about the X.

## Examples

### Metadata

This is the simplest one, and we can find it everywhere. **Metadata**, according to the definition above, is a piece of data about the data. The thing itself is a kind of data, and it’s also describing the data.

For example, the metadata of this post is:

```yaml
title: “Meta-” in Programming
tag: Misc
description: From programming, beyond programming.
date: "2023-05-20T08:53:23.640Z"
```

Great, it’s a piece of data. And it describes another piece of data: this post.

### Meta-framework

If you are a web developer, then you must have heard of the word **“meta-framework”**. If we call **React** a framework (let’s not debate on it here), then **Next.js** is its meta-framework. Of course, there are a lot of meta-frameworks for various use-cases. Here is an article to dive into it: [Unraveling the JavaScript Meta-framework Ecosystem](https://prismic.io/blog/javascript-meta-frameworks-ecosystem).

### Metaprogramming

It may sound a bit overwhelming for some people. Many of them thought **metaprogramming** is magic. Actually, it’s pretty simple, just another form of programming.

Metaprogramming in some programming languages can be hard, because there are no first-class techniques for it in those languages. For example, if you want to implement a compile-time polymorphism method in C++, and you want to perform some complex overload resolution. Well, you need something called **[SFINAE](https://en.wikipedia.org/wiki/Substitution_failure_is_not_an_error)** (acronym for “substitution failure is not an error”). It may seem difficult for beginners.

But in some programming languages, metaprogramming can be very easy. Let’s say we want to make a type provide a method to return its type name. In Rust, you can use something called **[Procedural Macros](https://doc.rust-lang.org/reference/procedural-macros.html#procedural-macros).**

First, define a trait called `Describe`:

```rust
trait Describe {
    fn type_name(&self) -> &'static str;
}
```

Then, create a derive macro:

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

It’s just a piece of ordinary Rust code that manipulates another piece of Rust code. And you gain a lot of powerful compiler abilities for automatic code generation.

Now you can use it like:

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

### Metaclass

Some programming languages have the concept of **metaclass**. Typically, those languages have first-class class.

Confused?

First-class class means classes in a language are treated just like other citizens. A number, a string and a class, they all can be stored in a variable.

In Ruby, objects’ instance methods are defined on their classes. When you call `foo.bar()`, the Ruby VM will search for `bar` method on the class of `foo`. But what should we do if we want to declare a class method?

In other programming languages who don’t have first-class classes (like C++, Java, Swift, etc.), classes are special things for compiler. Both instance methods and class methods are just different assets of a class. They don’t need to follow a unified pattern when dispatching methods.

Back to Ruby, whenever you perform `x.y()`, the VM will follow the same pattern to dispatch the call, no matter `x` is an object or a class. Now, the approach of declaring class methods should be obvious. To avoid the noise of syntactic sugars, I will use `define_method` here, and it has the same effect as the `def` syntax:

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

By accessing `singleton_class` property, you can get the metaclass of `Foo` and define methods on it. I won’t dig into `singleton_class` and the difference between it and `class`. But it’s enough for explaining what metaclass is. Of course, it would be fun to discover the design of Ruby’s object system by researching it!

## Wrap-up

We have given a few examples in this post, but it just cannot cover all the similar words. But I think it should give you a overview of what “meta-” really is. Hope it’s helpful to you.
