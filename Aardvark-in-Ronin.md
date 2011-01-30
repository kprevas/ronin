---
Aardvark in Ronin
---

Ronin uses [Aardvark][1] for its command-line interface. Aardvark is based on Ant, but allows you to write your build scripts in plain Gosu.

roninit automatically creates a build.vark file for your project. By default it is empty, except for a classpath statement and some comments:

```js
  classpath "./support/"

  /* This vark file is used to develop your ronin application.  Ronin provies
     some default targets that can be used even though this file is empty.
  
     run 'vark -p' to see all the targets avaiable*/
```

You can add any vark targets you like to this file. Consult [http://vark.github.com][1] for more information.

The classpath statement in the default vark file adds a few default targets to your project, via the enhancement located at support/vark/RoninVarkTargets.gsx. Here are some common ones (you can always see all of them with vark -p):

## `vark server`
This starts up the development server, a Jetty instance, as well as a default H2 instance to develop against. The server will be in development mode, with full refresh, logging and tracing enabled.

## `vark war`
Creates a war file in the build directory that will allow you to deploy your ronin application to a servlet container, such as Tomcat.

## `vark reset-db`
Erases the content of your development database.

## `vark verify-app`
Verifies the resources in your app to ensure that there are no compilation or statically detectable configuration errors.

## `vark deps`
Ensures that all third-party dependency jars are up to date.  Ronin uses [Ivy][2] to manage dependencies.  If you need to use a third-party dependency that Ronin doesn't normally use, the easiest way to do so is to modify the `ivy.xml` file in the root of your Ronin app.  `vark deps` is run automatically before the other targets listed here, so there's normally no need to run it explicitly.

   [1]: http://vark.github.com
   [2]: http://ant.apache.org/ivy/