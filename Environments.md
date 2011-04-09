---
title: Server environments
layout: default
---

Ronin allows you to define alternate versions of any resources (Gosu classes, properties files,
etc.) in your app to be used in different environments.  For instance, you might want to use
one set of property values when running on a developer's machine and another set once the app is
deployed.

The `env` folder in your app is used for this purpose.  Each subfolder of `env` corresponds
to a JVM property (prefixed by "`ronin.`"), and each subfolder of one of those folders corresponds
to a possible value of that property and contains the resources to be used when that value is passed
in.

For example, the default Ronin application template includes a `mode` folder under `env`, with
`dev`, `test`, `staging`, and `prod` subfolders.  If the JVM property `ronin.mode` is set to "dev",
the resources in the `dev` folder are used.  The .dbc files in these folders specify database connection
information for [Tosa](Tosa.html), and are a great example of resources that you'd want to have different
in different environments.

(`ronin.mode` is actually a special case; see below for details.)

If a subfolder called `default` exists for a property, it will be used if the property is not specified
(or no other subfolders match the specified value).

The [RoBlog sample application](Sample-Application.html) uses this mechanism to implement
very rudimentary localization.  A properties file containing all of the user-visible strings
in the application is placed in each subfolder of the `env/locale` folder; these values are
then accessed via the Gosu type system's built-in handling of properties files.  At runtime,
if `locale=es`, the Spanish values are used.

Take care when using environment resources - it's quite possible (and quite easy) to define
a set of resources that will prevent your code from compiling when you run it in a different
environment, even if it works in your development environment.  We recommend that you avoid
environment-specific versions of resources like Gosu classes, and stick to more data-oriented
resources like properties files, XML files, etc.

## Application modes

A Ronin application can be run in one of four modes: **development**, **testing**, **staging**, and **production**.
The application mode is set via a JVM property called `ronin.mode`, which should be set to "dev", "test", "staging", or "prod".

Changing the application mode has the following effects:

  * `ronin.mode` behaves as a normal environment property (as described above); resources
    in `env/mode/dev`, for example, are used in development mode.

  * In development mode, logging and tracing levels are set higher by default, and
    the type system is refreshed on every request.  (This is slower, but allows you to
    see some changes without restarting the server.)
  
  * The current application mode is available to your code at runtime as `Ronin.Mode`.

