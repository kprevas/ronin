---
title: Using JSON
layout: default
---

If Ronin receives a request whose `Content-Type` header is set to
"`text/json`", it will expect the values to pass in to the parameters of the
target controller method to be encoded as JSON in the request body (instead of
form-encoded data in the request body or URL).

This is best shown by example. Say you have the following Gosu class:

{% highlight js %}
      class Person {
        var _name : String as Name
        var _age : int as Age
      }
{% endhighlight %}

and the following controller class:

{% highlight js %}
      class PersonCx extends RoninController {
        function friendsNamed(p : Person, names : String[]) {
          ...
        }
      }
{% endhighlight %}

The body of a JSON-based request to `friendsNamed()` might look something like
this:

{% highlight js %}
      {
        "p" : {
          "Name": "Bob",
          "Age": 25
        },
        "names": [
          "Sue",
          "Frank",
          "Joey"
        ]
{% endhighlight %}

The body of the request is a single JSON object, with a property defined for
each of the method's parameters. The first parameter's type is Person, so the
value passed in is another JSON object, with properties corresponding to each
of that object's properties. The second parameter is an array of Strings, so
the value passed in is a JSON array containing strings.
