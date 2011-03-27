---
title: Aardvark in Ronin
layout: default
---

Ronin uses [Aardvark][1] for its command-line interface. Aardvark is based on Ant, but allows you to write your build scripts in plain Gosu.

roninit automatically creates a build.vark file for your project. By default it is empty, except for a classpath statement and some comments:

{% highlight js %}
  classpath "./support"

  /* This vark file is used to develop your ronin application.  Ronin provies
     some default targets that can be used even though this file is empty.
  
     run 'vark -p' to see all the targets avaiable*/
{% endhighlight %}

You can add any vark targets you like to this file. Consult [http://vark.github.com][1] for more information.

The classpath statement in the default vark file adds a few default targets to your project, via the enhancement located at support/vark/RoninVarkTargets.gsx. Here are some common ones (you can always see all of them with vark -p):

## `vark server`
This starts up the development server, a Jetty instance, as well as a default H2 instance 
to develop against. The server will be in development mode, with full refresh, logging 
and tracing enabled.  

`vark server -waitForDebugger` will suspend execution of your Ronin
app until a debugger is connected.  (`waitForDebugger` can also be used with most of the following
targets.)

`vark server -dontStartDB` will start the server without starting an H2 web server.  When the
H2 web server is started, other JVMs won't be able to connect to the database, so use this
mode if you have, for example, a utility script that accesses the database while your
server is running.

`vark server -env property1=value1,property2=value2` will pass the given environment variables
in to your server as JVM arguments.  See [Server environments](Environments.html) for more on
how this can be used.

## `vark verify-app`
Verifies the resources in your app to ensure that there are no compilation or statically detectable configuration errors.

## `vark verify-all`
Runs `verify-app` once for each possible combination of [environment variables](Environments.html).
(If you have a lot of environment variables defined, this could take some time.)

## `vark test`
Runs the tests in the `test` folder and reports the results.

`vark test -parallelClasses` will run your test classes in parallel (but the methods within each class serially);
`vark test -parallelMethods` will run the methods in each test class in parallel (but the test classes serially).
`vark test -parallelClasses -parallelMethods` will run everything in parallel.  If you are running on a multi-core
machine or your tests perform a lot of I/O, running them in parallel may speed up the testing process; it will
also ensure that you haven't written your tests to be order-dependent, and that you haven't somehow introduced
any concurrency bugs into your application.  However, it can be more difficult to write tests that run correctly
in a fully parallel environment.

## `vark test-all`
Runs the tests in the `test` folder once for each possible combination of [environment variables](Environments.html),
with the exception of the application mode (`ronin.mode`), which is set to `test` for every run.  This could
take a long time if you have many environment variables defined.

## `vark reset-db`
Erases the content of your development database.

## `vark war`
Creates a war file in the build directory that will allow you to deploy your ronin application to a servlet container, such as Tomcat.

## `vark deps`
Ensures that all third-party dependency jars are up to date.  Ronin uses [Ivy][2] to manage dependencies.  If you need to use a third-party dependency that Ronin doesn't normally use, the easiest way to do so is to modify the `ivy.xml` file in the root of your Ronin app.  `vark deps` is run automatically before the other targets listed here, so there's normally no need to run it explicitly.

## `vark console`
Launches a client to connect to the [admin console](Admin-Console.html).

`vark console -port [portNumber] -username [username] -password [password]` will connect with the settings
provided.  If any of the three arguments are missing, the default (port 8022, username "admin", password "password")
will be used.

   [1]: http://vark.github.com
   [2]: http://ant.apache.org/ivy/