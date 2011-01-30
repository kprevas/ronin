Configuration of a Ronin server is done by creating a class in the `config`
package named `RoninConfig`. Ronin finds this class reflectively at startup if
it exists. This class must implement `IRoninConfig`; more commonly, you will
want to subclass `DefaultRoninConfig`, which provides standard implementations
of the methods on `IRoninConfig`.

Most common configuration should be performed by overriding
`DefaultRoninConfig`'s constructor, calling `super()`, and then setting the
following properties:

  * The **default action** is set via the `DefaultAction` property, and
defaults to "index". This is the name of the controller method that Ronin
attempts to call if no method is specified in a URL - for instance,
"`http://localhost:8080/Main`" will attempt to call `controller.Main.index()`.
The default action can not take any parameters. If no such method exists on a
controller, an error will be thrown as with any other malformed URL. Note that
this property is a String, since it likely refers to multiple methods across
controller classes, and therefore is not type-safe.

  * The **default controller** is set via the `DefaultController` property,
and defaults to `controller.Main` if such a class exists. The default
controller is a controller class to which URLs which do not specify a
controller - i.e. the URL of the application's root - are directed. For
instance, if `DefaultController` is `controller.Main`, and assuming
`DefaultAction` has the default value of "index", then
"`http://localhost:8080`" will attempt to call `controller.Main.index()`.
Unlike `DefaultAction`, this property is a type literal, so specifying an
invalid controller class will cause a compile error.

  * **Error handling** is performed by setting the `ErrorHandler` property.
The type of `ErrorHandler` is `IErrorHandler`, an interface with two methods:
`on404()` and `on500()`. `on404()` is called when a URL attempts to access a
controller or action which does not exist; `on500()` is called when the
parameters in the URL are malformed or do not match the action method's
signature. (It's also called if your controller is somehow incorrectly
configured, e.g. it does not extend `RoninController`.) The default
implementation of each method simply logs the error and sets the response code
to 404 or 500, respectively. You are encouraged to override these methods to
provide more graceful error handling, either by rendering a friendly error
message to the user or by redirecting the request appropriately.

  * **Logging** is configured by setting the `LogHandler` property. This is an
`ILogHandler`, an interface which contains a single method: `log(msg : Object,
level : LogLevel, component : String, exception : java.lang.Throwable)`. The
default implementation delegates to the servlet's logging mechanism; you are
free to plug in whatever logging implementation you like here.

  * Several other advanced configuration properties are available to customize
caching behavior, log/trace levels, etc.

Next, we'll learn more about [[controllers|Controllers]].
