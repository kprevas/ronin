package ronin.config

uses java.io.*
uses java.lang.*
uses java.util.*
uses java.util.concurrent.*
uses java.util.concurrent.locks.*

uses javax.servlet.*
uses javax.servlet.http.*
uses org.apache.commons.fileupload.*
uses org.apache.commons.fileupload.disk.*
uses org.apache.commons.fileupload.servlet.*

uses gw.lang.reflect.*
uses gw.lang.reflect.features.*

uses ronin.*
uses ronin.auth.*

/**
 *  The default implementation of {@link ronin.config.IRoninConfig}.
 *  Custom RoninConfig classes are recommended to subclass this class.
 */
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

  // filters
  var _filters : List<Filter> as Filters

  // handlers
  var _errorHandler : IErrorHandler as ErrorHandler
  var _logHandler : ILogHandler as LogHandler
  var _urlHandler : IURLHandler as URLHandler

  // authentication
  var _authManager : IAuthManager as AuthManager

  var _restrictedProperties : Set<IPropertyInfo> as RestrictedProperties

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
    Filters = {}
    RestrictedProperties = {}

    ErrorHandler = new DefaultErrorHandler()
    URLHandler = new DefaultURLHandler()
  }

  /**
   *  Creates a {@link ronin.config.IAuthManager} using the default implementation.
   *  @param getUser A block which can fetch the user object for a given username.
   *  @param userName The property on the user object which returns the user's username.
   *  @param userPassword The property on the user object which returns a hash of the user's password.
   *  @param userSalt The property on the user object which returns the salt used to hash the user's password.
   *  @param userRoles (Optional) The property on the user object which returns a list of the user's roles.  Default is null.
   *  @param hashAlgorithm (Optional) The name of the algorithm used to hash passwords.  Default is "SHA-256".
   *  @param hashIterations (Optional) The number of iterations in the hashing process.  Default is 1024.
   *  @return An IAuthManager, which should be assigned to {@link ronin.config.IRoninConfig#AuthManager}.
   */
  function createDefaultAuthManager<U>(getUser(username : String) : U,
    userName : PropertyReference<U, String>,
    userPassword : PropertyReference<U, String>,
    userSalt : PropertyReference<U, String>,
    userRoles : PropertyReference<U, Iterable<String>> = null,
    hashAlgorithm : String = "SHA-256",
    hashIterations : int = 1024) : IAuthManager {
    return new ShiroAuthManager(getUser, userName, userPassword, userSalt, userRoles, hashAlgorithm, hashIterations, this)
  }

  /**
   *  Default implementation of {@link ronin.config.IErrorHandler}.  Logs error messages and sets the HTTP
   *  response code.
   */
  class DefaultErrorHandler implements IErrorHandler {
    override function on404(e : FourOhFourException, req : HttpServletRequest, resp : HttpServletResponse) {
      Ronin.log(e.Message, ERROR, "Ronin", e.Cause)
      resp.setStatus(404)
      if(_mode != PRODUCTION) {
        e.printStackTrace(new PrintWriter(Ronin.CurrentRequest.Writer))
      }
    }

    override function on500(e : FiveHundredException, req : HttpServletRequest, resp : HttpServletResponse) {
      Ronin.log(e.Message, ERROR, "Ronin", e.Cause)
      resp.setStatus(500)
      if(_mode != PRODUCTION) {
        e.printStackTrace(new PrintWriter(Ronin.CurrentRequest.Writer))
      }
    }
  }

  /**
   *  Default implementation of {@link ronin.Cache.CacheStore} for the request cache.  Uses attributes on
   *  the HTTP request object to store cached values.
   */
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

  /**
   *  Default implementation of {@link ronin.Cache.CacheStore} for the session cache.  Stores cached values
   *  in the HTTP session.
   */
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

  /**
   *  Default implementation of {@link ronin.Cache.CacheStore} for the application cache.  Uses attributes on
   *  the servlet context to store cached values.
   */
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