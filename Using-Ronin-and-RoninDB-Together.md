---
Using Ronin and RoninDB Together
---

As you may have noticed, each RoninDB entity type defines `fromID()` and
`toID()` methods, which means that they are also valid Ronin entity types.
Using RoninDB entities in a Ronin app therefore requires no extra effort on
your part. For example, if you have a RoninDB type called `db.mydb.Person`,
you can define a Ronin controller like:

```js
    package controller

    uses db.mydb.Person

    class PersonController {
      static function view(p : Person) {
        ...
      }
    }
```

Accessing the URL "`http://localhost:8080/PersonController/view?p=5`" will
automatically fetch the `Person` object whose ID is 5 from the database and
pass it to your `view()` method.

The RoninDB transaction model is thread-local, so it is safe to use within a
Ronin request, since most web servers run each request in its own thread.
