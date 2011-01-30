A **view** in Ronin is typically just a Gosu template. (See the Gosu
documentation for more information on templates.) Unlike controller classes,
templates can be in any package.

For views which render HTML, you should not hard-code link URLs and form
targets in the HTML. This could lead to broken links if you remove or rename a
controller class or method, or change its parameters. Instead, use the
`urlFor()`, `postUrlFor()`, and `target()` methods (see below).

It is recommended that the following directive be inserted at the top of each
Ronin template:

```js
    <%@ extends ronin.RoninTemplate %>
```

This allows Gosu code in the template unqualified access to the following
convenience methods:

  * `h()` takes a String, and returns a copy of that String escaped for HTML.
  * `g()` takes a String, and returns a copy of that String escaped for inclusion in a Gosu string literal.
  * `urlFor()` generates a URL, given a feature literal for the desired controller method. See [Link targets][2] for more information.
  * `target()` can be used in a `using` block to set up a context for part of the template (such as an HTML form). Pass in a feature literal for a controller method, and you can then use the following properties and methods within the `using` block:
    * `TargetURL` is a property which returns the base URL for the controller method, with no parameters included. Use this as the target of your HTML form, AJAX request, etc.
    * `n()` is a convenience method which generates parameter names for the controller method, to use e.g. as the `name` of an HTML input. It can be used in one of the following ways:
      * Pass in a type: `n(String)`. The name of the first parameter of that type is returned.
      * Pass in an object: `n("foo")`. The name of the first parameter whose type matches that object is returned.
      * Pass in a property literal: `n(Post#Author)`. The dot path to that property on the first matching parameter is returned.
      * If the parameter is an array type, pass in the desired index as a second argument to `n()`.
  * `postUrlFor()` generates the base URL for a controller method, with no parameters included. This is a simpler alternative to `TargetURL`, as it doesn't require a `using(target())` block. The argument to `postUrlFor()` is a
method literal, whose arguments need not be bound.
  * `Writer`, `Session`, `Request`, and `Response` are analogous to the same properties on a controller class. Similarly, `log()`, `trace()`, `cache()`, and `invalidate()` are available, though less useful than in a controller.

Next, let's learn how to [[generate links within an app|Link Targets]].
