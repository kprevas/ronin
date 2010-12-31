package ronin.config

uses java.lang.*
uses java.util.*
uses java.util.concurrent.*
uses java.util.concurrent.locks.*

uses javax.servlet.http.*

uses gw.lang.reflect.*

uses ronin.*

class DefaultRoninConfig implements IRoninConfig {

  // The servlet
  private var _servlet : RoninServlet as RoninServlet

  // caches
  var _requestCache : Cache  as RequestCache
  var _sessionCache : Cache  as SessionCache
  var _applicationCache : Cache as ApplicationCache

  // configuration vars
  var _mode : ApplicationMode as Mode
  var _logLevel : LogLevel as LogLevel
  var _traceEnabled : boolean as TraceEnabled

  // action defaults
  var _defaultAction : String as DefaultAction
  var _defaultController : Type as DefaultController

  // handlers
  var _errorHandler : IErrorHandler as ErrorHandler
  var _logHandler : ILogHandler as LogHandler

  construct(m : ApplicationMode, an : RoninServlet) {
    RoninServlet = an

    RequestCache = new Cache(new DefaultRequestCacheStore())
    SessionCache = new Cache(new DefaultSessionCacheStore())
    ApplicationCache = new Cache(new DefaultApplicationCacheStore())

    Mode = m
    LogLevel = Mode == Development ? DEBUG : WARN
    TraceEnabled = Mode == Development

    DefaultController = TypeSystem.getByFullNameIfValid("controller.Main")
    DefaultAction = "index"

    ErrorHandler = new DefaultErrorHandler()
    LogHandler = new DefaultLogHandler()
  }

  class DefaultLogHandler implements ILogHandler {
    function log(msg : Object, level : LogLevel, component : String, exception : java.lang.Throwable) {
      if(exception != null) {
        RoninServlet.log(msg.toString(), exception)
      } else {
        RoninServlet.log(msg.toString())
      }
    }
  }

  class DefaultErrorHandler implements IErrorHandler {
    function on404(e : FourOhFourException, req : HttpServletRequest, resp : HttpServletResponse) {
      Ronin.log(e.Message, ERROR, "RoninServlet", e.Cause)
      resp.setStatus(404)
    }

    function on500(e : FiveHundredException, req : HttpServletRequest, resp : HttpServletResponse) {
      Ronin.log(e.Message, ERROR, "RoninServlet", e.Cause)
      resp.setStatus(500)
    }
  }

  static class DefaultRequestCacheStore implements Cache.CacheStore {
    property get Lock() : ReadWriteLock {
      return null // no locking necessary on requests, right?
    }

    function loadValue(key : String) : Object {
      return Ronin.CurrentRequest.HttpRequest.getAttribute(key)
    }

    function saveValue(key : String, value : Object) {
      Ronin.CurrentRequest.HttpRequest.setAttribute(key, value)
    }
  }

  static class DefaultSessionCacheStore implements Cache.CacheStore {
    property get Lock() : ReadWriteLock {
      return null
    }

    function loadValue(key : String) : Object {
      return Ronin.CurrentRequest.HttpRequest.Session.getAttribute(key)
    }

    function saveValue(key : String, value : Object) {
      Ronin.CurrentRequest.HttpRequest.Session.setAttribute(key, value)
    }
  }

  static class DefaultApplicationCacheStore implements Cache.CacheStore {
    var _lock = new ReentrantReadWriteLock()
    property get Lock() : ReadWriteLock {
      return _lock
    }

    function loadValue(key : String) : Object {
      return Ronin.CurrentRequest.HttpRequest.Session.ServletContext.getAttribute(key)
    }

    function saveValue(key : String, value : Object) {
      Ronin.CurrentRequest.HttpRequest.Session.ServletContext.setAttribute(key, value)
    }
  }
}