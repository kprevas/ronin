---
title: Retrieving Data
layout: default
---

RoninDB provides several ways to retrieve an entity from the database.

The static `fromID()` method on an entity type retrieves the entity of that
type where the value in the "`id`" column matches the argument. (Assuming
you've set the "`id`" column as a primary key, this is typically the fastest
way to retrieve an entity.) For example,

```js
    Person.fromID(5)
```

returns the `Person` whose "`id`" is "5".

The static `find()` method on an entity type retrieves all entities of that
type matching the "template" entity passed in as an argument. For example,

```js
    Person.find(new Person() {:Name="Bob"})
```

returns all `Person` objects whose `Name` is "Bob". Note that any properties
on the template object whose value is null are ignored, so this method can not
be used to find e.g. all `Person` objects whose `PhoneNumber` is null.

The static `findSorted()` method on an entity type retrieves all entities of
that type matching the "template" entity passed in as the first argument, and
sorts them on the property provided via a property literal as the second
argument; the third argument is a boolean indicating ascending (`true`) or
descending (`false`) order. For example,

```js
    Person.findSorted(new Person() {:Name="Bob"}, Person#PhoneNumber, true)
```

returns all `Person` objects whose `Name` is "Bob", sorted by their
`PhoneNumber` in ascending order.

The static `findPaged()` method on an entity type finds entities of that type
matching the "template" entity passed in as an argument, splits them into
"pages" whose size is specified by the second argument, and returns the "page"
specified by the third argument. (This corresponds to the "limit" and "offset"
parameters in SQL.) For example,

```js
    Person.findPaged(new Person() {:Name="Bob"}, 10, 2)
```

returns the `Person` objects whose `Name` is "Bob" from 20-29.

The static `findSortedPaged()` method on an entity type combines the above two
methods.

```js
    Person.findSortedPaged(new Person() {:Name="Bob"}, Person#PhoneNumber, true, 10, 2)
```

The static `findWithSql()` method on an entity type runs the given SQL select
command, and returns the corresponding objects. This is the method to use for
more complex queries than those supported by the above methods. Note that the
select command must be "select `*`", or the objects returned will not have
their properties correctly initialized.

```js
    Person.findWithSql("select * from Person where Name is not null and PhoneNumber like '555%'")
```

The static `count()` and `countWithSql()` methods on an entity type work
similarly to their counterparts above, but instead of returning a list of
entity objects, they return an integer representing the number of entities
that match the given criteria. (This is typically much faster than actually
retrieving the objects.)

Next, we'll see how RoninDB handles [relationships between entities](Foreign-Keys-and-Join-Tables.html).
