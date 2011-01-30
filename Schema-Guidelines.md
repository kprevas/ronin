---
Schema Guidelines
---

RoninDB follows the principle of [convention over configuration][2]. It
expects your database schema to adhere to the following guidelines.

  * **Entity tables** are tables which will be represented as types in Gosu.
An entity table must have a single primary key column called "`id`". (Note
that "id" must be lowercase. If you're using H2, you'll need to put quotes
around the column name, or else it will capitalize it automatically.)

  * **Foreign keys** from one entity table to another can either be named
"`[target table]_id`" or "`[name]_[target table]_id`", where "name" is the
name you'd like Gosu to use for the foreign key.

  * **Join tables** can either be named "`join_[first table]_[second table]`"
or "`[name]_join_[first table]_[second table]`", where "name" is the name
you'd like Gosu to use for the join property. The join table must have columns
named "`[first table]_id`" and "`[second table]_id`". If the two sides of the
join are the same table, the columns must instead be named "`[table
name]_src_id`" and "`[table name]_dest_id`".

Next we'll see [[how to connect to the database|Connecting to a Database]].


   [2]: http://en.wikipedia.org/wiki/Convention_over_configuration
