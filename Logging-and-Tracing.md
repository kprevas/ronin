---
title: Logging and Tracing
layout: default
---

You can log in Controllers and Views by using the `log()` method:

{% highlight js %}
    package controller

    class MyController {
      function index() {
        log( "Rendering index...")
        Main.render(Writer)
      }
    }
{% endhighlight %}

The `log()` method takes advantage of Gosu's named arguments and default
parameters, allowing you to better target your log message:

{% highlight js %}
      log( "A debug message", :level = DEBUG ) // only logs if debug logging is enabled via RoninServlet#LogLevel
      log( "A message in the model", :component = "Model" ) // a log message associated w/ the "Model" component
      try {
        something()
      } catch( e ) {
        log( "An exception occurred!", :exception = e ) // logs the exception
      }
{% endhighlight %}

You can combine named parameters for more elaborate logging messages.

The default logging level is `INFO`.

## Lazy Logging

Sometimes your logging message might be expensive to compute, and you only
want to perform the computation if the log message is actually going to be
written. You can achieve this by using a no-argument block to the log method:

{% highlight js %}
      log( \-> aVeryExpensiveMethod(), :level = DEBUG )
{% endhighlight %}

Unless the Ronin application is configured to log debugging messages,
`aVeryExpensiveMethod()` will never be called.

## Configuring Logging

By default, Ronin uses the [SLF4J][1] API for logging.  It includes an SLF4J implementation
that outputs log messages to the console based on the `LogLevel` property on `RoninConfig`.
If you'd like to use a different SLF4J implementation (e.g. log4j), replace the roninlog.jar
file in your support folder with the appropriate implementation jar.

If you don't want to use SLF4J at all, you can replace the logging implementation wholesale.
In your `config.RoninConfig` class you can set up a new logging adapter like so:

{% highlight js %}
    package config

    uses ronin.*
    uses ronin.config.*

    /**
     * This class gives you a way to programatically configure the ronin servlet
     */

    class RoninConfig implements IRoninConfig {

      construct(m : ApplicationMode, an : RoninServlet) {
        super(m, an)
        DefaultController = controller.Main
        DefaultAction = "index"
        LogHandler = new MyCustomLogHandler() // <-- set up a custom log handler
      }

    }
{% endhighlight %}

Where `MyCustomLogHandler` is a Gosu class that implements the
`ronin.config.ILogHandler` interface.

This class can wire through to whatever you like: StdOut, Log4j, whatever.

## Tracing

Ronin provides basic tracing support to help you understand where time is
going in requests. While this is not a complete substitute for serious
profiling tools like JProfiler, it can give you a good idea of why your
application is so slow.

By default, Ronin (and Tosa) log controller calls, template rendering and
SQL statements. Here is an example trace from RoBlog:

         [java] 3600362 [qtp2028347345-15] INFO Ronin - request for /PostCx/index - 1104.521 ms
         [java] 3600362 [qtp2028347345-15] INFO Ronin -   controller.PostCx.beforeRequest() - 0.214 ms
         [java] 3600362 [qtp2028347345-15] INFO Ronin -   controller.PostCx.index - 555.263 ms
         [java] 3600362 [qtp2028347345-15] INFO Ronin -   db.roblog.BlogInfo.find() - 1.005 ms
         [java] 3600362 [qtp2028347345-15] INFO Ronin -     select * from "BlogInfo" where true order by "id" ASC
         [java] 3600362 [qtp2028347345-15] INFO Ronin -   view.Layout.render() - 239.046 ms
         [java] 3600362 [qtp2028347345-15] INFO Ronin -     db.roblog.BlogInfo.find() - 0.519 ms
         [java] 3600362 [qtp2028347345-15] INFO Ronin -       select * from "BlogInfo" where true order by "id" ASC
         [java] 3600362 [qtp2028347345-15] INFO Ronin -     view.All.render() - 135.492 ms
         [java] 3600362 [qtp2028347345-15] INFO Ronin -       db.roblog.Post.findSortedPaged() - 0.884 ms
         [java] 3600362 [qtp2028347345-15] INFO Ronin -         select * from "Post" where true order by "Posted" DESC, "id" ASC limit 20 offset 0
         [java] 3600362 [qtp2028347345-15] INFO Ronin -   controller.PostCx.afterRequest() - 0.103 ms

This gives you a good idea of the perf "shape" of your requests, and where
optimizations might be necessary.

If you wish to add a custom trace component in a Controller or Template, you
can use the `trace()` method like so:

{% highlight js %}
      function myExpensiveFunction() {
        using( trace("myExpensiveMethod") ) {
          // some expensive logic
        }
      }
{% endhighlight %}

The "myExpensiveMethod" string will now appear in your trace with a timing and
with all elements that occur within the using statement nested below it. This
can help you narrow down what, exactly is causing slowness in your app.

Note that `trace()`, like `log()`, can take a no-argument block that returns a
String, so that expensive trace messages can be constructed only if necessary.

  [1]: http://www.slf4j.org