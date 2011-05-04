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
uses org.apache.shiro.realm.ldap.JndiLdapRealm
uses org.apache.shiro.realm.ldap.JndiLdapContextFactory

uses gw.lang.reflect.*
uses gw.lang.reflect.features.*

uses ronin.*
uses ronin.auth.*
uses gw.lang.reflect.gs.IGosuClass
uses gw.lang.reflect.gs.IGosuClassLoader
uses gw.lang.reflect.gs.GosuClassTypeLoader

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
  var _returnValueHandler : IReturnValueHandler as ReturnValueHandler

  // authentication
  var _authManager : IAuthManager as AuthManager

  var _restrictedProperties : Set<IPropertyInfo> as RestrictedProperties
  var _loginRedirect : MethodReference as LoginRedirect
  property set LoginRedirect(methodRef : MethodReference) {
    if(methodRef != null) {
      var noAuthMethodAnnotation = methodRef.MethodInfo.getAnnotation(NoAuth)?.Instance
      if(noAuthMethodAnnotation == null) {
        var noAuthTypeAnnotation = methodRef.RootType.TypeInfo.getAnnotation(NoAuth)?.Instance
        if(noAuthTypeAnnotation == null) {
          throw "LoginRedirect must be a method annotated with @NoAuth, or on a class annotated with @NoAuth."
        }
      }
    }
    _loginRedirect = methodRef
  }
  
  // webservices
  var _webservices : List<IType> as Webservices

  construct(m : ApplicationMode, an : RoninServlet) {
    RoninServlet = an

    RequestCache = new Cache(new DefaultRequestCacheStore())
    SessionCache = new Cache(new DefaultSessionCacheStore())
    ApplicationCache = new Cache(new DefaultApplicationCacheStore() {:Servlet = an})

    Mode = m
    LogLevel = (Mode == DEVELOPMENT or Mode == TESTING) ? DEBUG : WARN
    TraceEnabled = (Mode == DEVELOPMENT or System.getProperty("ronin.trace") == "true")

    DefaultController = TypeSystem.getByFullNameIfValid("controller.Main")
    DefaultAction = "index"

    XSRFLevel = {POST, PUT, DELETE}
    ServletFileUpload = new ServletFileUpload(new DiskFileItemFactory())
    Filters = {}
    RestrictedProperties = {}

    ErrorHandler = new DefaultErrorHandler()
    URLHandler = new DefaultURLHandler()
    ReturnValueHandler = new DefaultReturnValueHandler()
    Webservices = findWebservices()
  }

  /**
   *  Creates a {@link ronin.config.IAuthManager} using the default implementation.
   *  @param getUser A block which can fetch the user object for a given username.
   *  @param getOrCreateUserByOpenID A block which can fetch the user object for a given identity and/or e-mail address provided by an
   *  OpenID provider, or optionally create a new user for the identity/address.  May be null if you don't intend to support OpenID.
   *  @param userName The property on the user object which returns the user's username.
   *  @param userPassword The property on the user object which returns a hash of the user's password.
   *  @param userSalt The property on the user object which returns the salt used to hash the user's password.
   *  @param userRoles (Optional) The property on the user object which returns a list of the user's roles.  Default is null.
   *  @param hashAlgorithm (Optional) The name of the algorithm used to hash passwords.  Default is "SHA-256".
   *  @param hashIterations (Optional) The number of iterations in the hashing process.  Default is 1024.
   *  @return An IAuthManager, which should be assigned to {@link ronin.config.IRoninConfig#AuthManager}.
   */
  function createDefaultAuthManager<U>(getUser(username : String) : U,
    getOrCreateUserByOpenID(identity : String, email : String, idProvider : String) : U,
    userName : PropertyReference<U, String>,
    userPassword : PropertyReference<U, String>,
    userSalt : PropertyReference<U, String>,
    userRoles : PropertyReference<U, Iterable<String>> = null,
    hashAlgorithm : String = "SHA-256",
    hashIterations : int = 1024) : IAuthManager {
    var realm = new ShiroRealm(getUser, getOrCreateUserByOpenID, userName, userPassword, userSalt, userRoles, hashAlgorithm, hashIterations)
    return new ShiroAuthManager(realm, hashAlgorithm, hashIterations, this)
  }

  function createLDAPAuthManager(url : String, userDnTemplate : String, authMechanism : String = null) : IAuthManager {
    var realm = new JndiLdapRealm() {:UserDnTemplate = userDnTemplate}
    var contextFactory = realm.ContextFactory as JndiLdapContextFactory
    contextFactory.Url = url
    contextFactory.AuthenticationMechanism = authMechanism
    return new ShiroAuthManager(realm, null, 0, this)
  }
  
  /**
   * Registers all classes in the 'webservices' package that have the correct @WSIWebservice annotation
   * as webservices
   */
  function findWebservices() : List<IType> {
    var lst = new ArrayList<IType>()
    var loader = TypeSystem.getTypeLoader( GosuClassTypeLoader )
    for( name in loader.AllTypeNames ) {
      if( name.toString().startsWith( "webservices." ) ) {
        lst.add( TypeSystem.getByFullName( name.toString() ) )
      }
    }
    return lst
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
      if(value == null) {
        Ronin.CurrentRequest.HttpRequest.removeAttribute(key)
      } else {
        Ronin.CurrentRequest.HttpRequest.setAttribute(key, value)
      }
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
      if(value == null) {
        Ronin.CurrentRequest.HttpRequest.Session.removeAttribute(key)
      } else {
        Ronin.CurrentRequest.HttpRequest.Session.setAttribute(key, value)
      }
    }
  }

  /**
   *  Default implementation of {@link ronin.Cache.CacheStore} for the application cache.  Uses attributes on
   *  the servlet context to store cached values.
   */
  static class DefaultApplicationCacheStore implements Cache.CacheStore {
    var _lock = new ReentrantReadWriteLock()
    var _servlet : HttpServlet as Servlet

    override property get Lock() : ReadWriteLock {
      return _lock
    }

    override function loadValue(key : String) : Object {
      return _servlet.ServletContext.getAttribute(key)
    }

    override function saveValue(key : String, value : Object) {
      if(value == null) {
        _servlet.ServletContext.removeAttribute(key)
      } else {
        _servlet.ServletContext.setAttribute(key, value)
      }
    }
  }
}