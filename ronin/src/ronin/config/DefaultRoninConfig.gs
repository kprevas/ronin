package ronin.config

uses java.lang.*
uses java.util.*
uses java.util.concurrent.*
uses java.util.concurrent.locks.*

uses javax.servlet.http.*
uses org.apache.commons.fileupload.*
uses org.apache.commons.fileupload.disk.*
uses org.apache.commons.fileupload.servlet.*

uses gw.lang.reflect.*
uses gw.lang.reflect.features.*

uses ronin.*
uses ronin.auth.*

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

  // XSRF protection settings
  var _xsrfLevel : List<HttpMethod> as XSRFLevel

  // file upload handler
  var _servletFileUpload : ServletFileUpload as ServletFileUpload

  // handlers
  var _errorHandler : IErrorHandler as ErrorHandler
  var _logHandler : ILogHandler as LogHandler

  // authentication
  var _authManager : IAuthManager as AuthManager

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

    XSRFLevel = {POST, PUT, DELETE}
    ServletFileUpload = new ServletFileUpload(new DiskFileItemFactory())

    ErrorHandler = new DefaultErrorHandler()
    LogHandler = new DefaultLogHandler()
  }

  function initDefaultAuthManager<U>(getUser(username : String) : U,
    userName : PropertyReference<U, String>,
    userPassword : PropertyReference<U, String>,
    userSalt : PropertyReference<U, String>,
    userRoles : PropertyReference<U, Iterable<String>> = null,
    hashAlgorithm : String = "SHA-256",
    hashIterations : int = 1024) {
    AuthManager = new ShiroAuthManager() {:HashAlgorithm = hashAlgorithm, :HashIterations = hashIterations}
    RoninFilter.getInstance().delegateTo(new ShiroFilter(getUser, userName, userPassword, userSalt, userRoles, hashAlgorithm, hashIterations))
  }

  class DefaultLogHandler implements ILogHandler {
    override function log(msg : Object, level : LogLevel, component : String, exception : java.lang.Throwable) {
      if(exception != null) {
        RoninServlet.log(msg.toString(), exception)
      } else {
        RoninServlet.log(msg.toString())
      }
    }
  }

  class DefaultErrorHandler implements IErrorHandler {
    override function on404(e : FourOhFourException, req : HttpServletRequest, resp : HttpServletResponse) {
      Ronin.log(e.Message, ERROR, "RoninServlet", e.Cause)
      resp.setStatus(404)
    }

    override function on500(e : FiveHundredException, req : HttpServletRequest, resp : HttpServletResponse) {
      Ronin.log(e.Message, ERROR, "RoninServlet", e.Cause)
      resp.setStatus(500)
    }
  }

  static class DefaultRequestCacheStore implements Cache.CacheStore {
    override property get Lock() : ReadWriteLock {
      return null // no locking necessary on requests, right?
    }

    override function loadValue(key : String) : Object {
      return Ronin.CurrentRequest.HttpRequest.getAttribute(key)
    }

    override function saveValue(key : String, value : Object) {
      Ronin.CurrentRequest.HttpRequest.setAttribute(key, value)
    }
  }

  static class DefaultSessionCacheStore implements Cache.CacheStore {
    override property get Lock() : ReadWriteLock {
      return null
    }

    override function loadValue(key : String) : Object {
      return Ronin.CurrentRequest.HttpRequest.Session.getAttribute(key)
    }

    override function saveValue(key : String, value : Object) {
      Ronin.CurrentRequest.HttpRequest.Session.setAttribute(key, value)
    }
  }

  static class DefaultApplicationCacheStore implements Cache.CacheStore {
    var _lock = new ReentrantReadWriteLock()
    override property get Lock() : ReadWriteLock {
      return _lock
    }

    override function loadValue(key : String) : Object {
      return Ronin.CurrentRequest.HttpRequest.Session.ServletContext.getAttribute(key)
    }

    override function saveValue(key : String, value : Object) {
      Ronin.CurrentRequest.HttpRequest.Session.ServletContext.setAttribute(key, value)
    }
  }
}