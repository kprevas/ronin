The `redirect()` method on a controller class and the `urlFor()` method on a
view template both take a single argument, which is a _feature literal_
representing the target of the redirect or the URL. Feature literals are a,
er, feature of Gosu that allows you to reference a method or property without
invoking it. They are used extensively in Ronin.

Say you have the following method on `controller.Main`:

```js
    function addComment(p : Post, text : String) {
      ...
    }
```

and you want to create a link which will add a comment with the text "Hello"
to a particular post. The following code will give you the URL for that link:

```js
    var post = [code to retrieve the post goes here]
    var url = urlFor(controller.Main#addComment(post, "Hello"))
```

The `#` operator is what makes this a feature literal, rather than a method
invocation, and `addComment()` will **not** be called by this code. Instead,
`urlFor()` returns "`http://localhost:8080/Main/addComment?p=5&text=Hello`"
(assuming the post's ID is 5).

In order for entity types to work with these methods, they must define a
method called `toID()` which takes no arguments and returns a unique
identifier for the object on which it is called. (This identifier, when passed
to the type's `fromID()` method, should return the original object.)

Next, we'll go over some [[general tips and tricks|Tips and Tricks]] for writing Ronin apps.
