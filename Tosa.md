---
title: Tosa
layout: default
---

## Why Tosa?

Sometimes you just want a quick and dirty data persistence solution that's
easy to use. You don't want to deal with XML configuration files, or code
generation, but you don't want to have to memorize your database schema,
either. Tosa provides a low-effort, type-safe object-relational mapping
layer on top of a SQL database (theoretically, any database that JDBC
supports). Just set up your database schema following a few simple guidelines,
and you automatically have object-oriented access to your data with compile-
time error checking.

## Getting started

Here's what you need to get started with Ronin:

  * [Java][3] 6 or later.

  * [Gosu][4].

  * Tosa.jar - download [here][5].

  * A database, such as [H2][6] or [MySQL][7].

Once you've got all that, you're ready to start using Tosa.

Alternatively, if you're going to use Tosa for a Ronin app, you can follow
the setup instructions for [Ronin](Ronin.html); Tosa (plus the H2 database) will be
installed for you.

First, let's look at the [database schema guidelines](Schema-Guidelines.html).

   [1]: #Why_RoninDB?

   [2]: #Getting_started

   [3]: http://java.sun.com/javase/downloads/index.jsp

   [4]: http://www.gosu-lang.org/

   [5]: http://github.com/akeefer/Tosa/downloads

   [6]: http://www.h2database.com/

   [7]: http://www.sun.com/software/products/mysql/

   [8]: /p/ronin/wiki/Ronin

   [9]: /p/ronin/wiki/SchemaGuidelines
