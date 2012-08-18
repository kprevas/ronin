package ronin

uses ronin.config.*

uses gw.util.Pair
uses gw.lang.*
uses gw.lang.reflect.*
uses gw.lang.reflect.features.*

uses java.lang.*
uses java.io.*
uses java.util.*
uses java.net.URLEncoder
uses java.security.MessageDigest

uses javax.servlet.http.*

enhancement IRoninUtilsEnhancement : IRoninUtils {

  /**
   *  Logs a message using the configured log handler.
   *  @param msg The text of the message to log, or a block which returns said text.
   *  @param level (Optional) The level at which to log the message.
   *  @param component (Optional) The logical component from whence the message originated.
   *  @param exception (Optional) An exception to associate with the message.
   */
  static function log(msg : Object, level : LogLevel = null, component : String = null, exception : java.lang.Throwable = null) {
    Ronin.log(msg, level, component, exception)
  }

  /**
   *  Registers a low-level trace message.  Pass the return value of this method to a using() statement
   *  to indent all trace messages occuring within the using() block, and to optionally measure the time
   *  elapsed within the using() block.
   *  @param msg The text of the trace message, or a block which returns said text.
   *  @param printTiming (Optional) Whether to print the time elapsed within the traced block.  Defaults to true.
   *  @return An object to be passed to a using() statement.
   */
  static function trace(msg : Object, printTiming : boolean = true) : Trace.TraceElement {
    return Ronin.CurrentTrace?.withMessage(msg, printTiming)
  }

  /**
   *  Retrieves a value from a cache, or computes and stores it if it is not in the cache.
   *  @param value A block which will compute the desired value.
   *  @param name (Optional) A unique identifier for the value.  Default is null, which means one will be
   *  generated from the type of the value.
   *  @param store (Optional) The cache store used to retrieve or store the value.  Default is the request cache.
   *  @return The retrieved or computed value.
   */
  static function cache<T>(value : block():T, name : String = null, store : Ronin.CacheStore = null) : T {
    return Ronin.cache(value, name, store)
  }

  /**
   *  Invalidates a cached value in a cache.
   *  @param name The unique identifier for the value.
   *  @param store The cache store in which to invalidate the value.
   */
  static function invalidate(name : String, store : Ronin.CacheStore) {
    Ronin.invalidate(name, store)
  }

  /**
   *  Ronin's representation of the current request.
   */
  static property get RoninRequest() : RoninRequest {
    return Ronin.CurrentRequest
  }

  /**
   *  The current HTTP request.
   */
  static property get Request() : HttpServletRequest {
    return Ronin.CurrentRequest?.HttpRequest
  }

  /**
   *  The currently pending HTTP response.
   */
  static property get Response() : HttpServletResponse {
    return Ronin.CurrentRequest?.HttpResponse
  }

  /**
   *  The output writer for the current HTTP response.
   */
  static property get Writer() : Writer {
    return Response?.Writer
  }

  /**
   *  The HTTP method of the current request.
   */
  static property get Method() : HttpMethod {
    return Ronin.CurrentRequest?.HttpMethod
  }

  /**
   *  The current HTTP session, as a Map.
   */
  static property get Session() : Map<String, Object> {
    return Ronin.CurrentRequest?.HttpSession
  }

  /**
   *  The referring URL reported by the current request.
   */
  static property get Referrer() : String {
    return Ronin.CurrentRequest?.Referrer
  }

  /**
   *  The name used for the XSRF protection token.
   */
  static property get XSRFTokenName() : String {
    return "__ronin_XSRF"
  }

  /**
   *  The value of the current session's XSRF token.  Accessing this property enables XSRF protection,
   *  so all further requests in this session whose HTTP method is included in {@link ronin.config.IRoninConfig.XSRFLevel}
   *  must include this token.
   */
  static property get XSRFTokenValue() : String {
    if(Session[XSRFTokenName] != null) {
      return URLEncoder.encode(Session[XSRFTokenName] as String)
    }
    var token = new String(MessageDigest.getInstance("SHA1").digest((Request.Session.Id + System.currentTimeMillis()).Bytes))
    Session[XSRFTokenName] = token
    return URLEncoder.encode(token)
  }

  /**
   *  The user authentication and authorization handler.
   */
  static property get AuthManager() : IAuthManager {
    return Ronin.Config?.AuthManager
  }

  static internal property get PostLoginRedirect() : String {
    return Session["__ronin_postLogin"] as String
  }

  static internal property set PostLoginRedirect(s : String) {
    Session["__ronin_postLogin"] = s
  }

  /**
   *  Generates a URL which will result in the specified method invocation.
   *  @param target The desired method invocation.  Arguments must be bound.
   *  @return The URL as a String.
   */
  @URLMethodValidator
  static function urlFor(target : MethodReference) : String {
    return Ronin.Config.URLHandler.urlFor(target)
  }

  /**
   *  Generates a URL which will result in the specified method invocation, excluding parameters.
   *  @param target The desired method invocation.  Arguments should not be bound.
   *  @return The URL as a String.
   */
  static function postUrlFor(target : MethodReference) : String {
    return URLUtil.baseUrlFor(target)
  }

}