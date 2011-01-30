You can log in Controllers and Views by using the `log()` method:

```js
    package controller

    class MyController {
      function index() {
        log( "Rendering index...")
        Main.render(Writer)
      }
    }
```

The `log()` method takes advantage of Gosu's named arguments and default
parameters, allowing you to better target your log message:

```js
      log( "A debug message", :level = DEBUG ) // only logs if debug logging is enabled via RoninServlet#LogLevel
      log( "A message in the model", :component = "Model" ) // a log message associated w/ the "Model" component
      try {
        something()
      } catch( e ) {
        log( "An exception occurred!", :exception = e ) // logs the exception
      }
```

You can combine named parameters for more elaborate logging messages.

The default logging level is `INFO`.

## Lazy Logging

Sometimes your logging message might be expensive to compute, and you only
want to perform the computation if the log message is actually going to be
written. You can achieve this by using a no-argument block to the log method:

```js
      log( \-> aVeryExpensiveMethod(), :level = DEBUG )
```

Unless the Ronin application is configured to log debugging messages,
`aVeryExpensiveMethod()` will never be called.

## Configuring Logging

By default, Ronin uses the standard Servlet logging API, but people have
strong opinions on logging frameworks, so Ronin makes it trivial to plug in an
adapter to whatever logging system you want. In your `config.RoninConfig`
class you can set up a new logging adapter like so:

```js
    package config

    uses ronin.*
    uses ronin.config.*

    /**
     * This class gives you a way to programatically configure the ronin servlet
     */

    class RoninConfig implements IRoninConfig {

      override function init( servlet : RoninServlet ) {
        servlet.DefaultController = controller.Main
        servlet.DefaultAction = "index"
        servlet.LogHandler = new MyCustomLogHandler() // <-- set up a custom log handler
      }

    }
```

Where `MyCustomLogHandler` is a Gosu class that implements the
`ronin.config.ILogHandler` interface.

This class can wire through to whatever you like: StdOut, Log4j, whatever.

# Tracing

Ronin provides basic tracing support to help you understand where time is
going in requests. While this is not a complete substitute for serious
profiling tools like JProfiler, it can give you a good idea of why your
application is so slow.

By default, Ronin (and RoninDB) log controller calls, template rendering and
SQL statements. Here is an example trace from RoBlog:

         [java] 2010-12-28 11:14:46.402:INFO:/:RoninServlet: TRACE
         [java] 2010-12-28 11:14:46.402:INFO:/:RoninServlet: controller.PostCx.beforeRequest() - 0 ms
         [java] 2010-12-28 11:14:46.403:INFO:/:RoninServlet: controller.PostCx.index - 555 ms
         [java] 2010-12-28 11:14:46.403:INFO:/:RoninServlet: db.roblog.BlogInfo.find() - 1 ms
         [java] 2010-12-28 11:14:46.403:INFO:/:RoninServlet:       select * from "BlogInfo" where true order by "id" ASC
         [java] 2010-12-28 11:14:46.403:INFO:/:RoninServlet: view.Layout.render() - 239 ms
         [java] 2010-12-28 11:14:46.403:INFO:/:RoninServlet: db.roblog.BlogInfo.find() - 0 ms
         [java] 2010-12-28 11:14:46.403:INFO:/:RoninServlet:         select * from "BlogInfo" where true order by "id" ASC
         [java] 2010-12-28 11:14:46.403:INFO:/:RoninServlet: view.All.render() - 135 ms
         [java] 2010-12-28 11:14:46.403:INFO:/:RoninServlet: db.roblog.Post.findSortedPaged() - 0 ms
         [java] 2010-12-28 11:14:46.403:INFO:/:RoninServlet:           select * from "Post" where true order by "Posted" DESC, "id" ASC limit 20 offset 0
         [java] 2010-12-28 11:14:46.403:INFO:/:RoninServlet: controller.PostCx.afterRequest() - 0 ms

This gives you a good idea of the perf "shape" of your requests, and where
optimizations might be necessary.

If you wish to add a custom trace component in a Controller or Template, you
can use the `trace()` method like so:

```js
      function myExpensiveFunction() {
        using( trace("myExpensiveMethod") ) {
          // some expensive logic
        }
      }
```

The "myExpensiveMethod" string will now appear in your trace with a timing and
with all elements that occur within the using statement nested below it. This
can help you narrow down what, exactly is causing slowness in your app.

Note that `trace()`, like `log()`, can take a no-argument block that returns a
String, so that expensive trace messages can be constructed only if necessary.
