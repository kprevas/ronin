package ronin

uses ronin.config.*

uses java.lang.*
uses java.io.*
uses java.util.*
uses java.net.URLEncoder
uses java.security.MessageDigest

uses javax.servlet.http.*

enhancement IRoninUtilsEnhancement : IRoninUtils {

  static function log(msg : Object, level : LogLevel = null, component : String = null, exception : java.lang.Throwable = null) {
    Ronin.log(msg, level, component, exception)
  }

  static function trace(msg : Object, printTiming : boolean = true) : Trace.TraceElement {
    return Ronin.CurrentTrace?.withMessage(msg, printTiming)
  }

  static function cache<T>(value : block():T, name : String = null, store : Ronin.CacheStore = null) : T {
    return Ronin.cache(value, name, store)
  }

  static function invalidate(name : String, store : Ronin.CacheStore) {
    Ronin.invalidate(name, store)
  }

  static property get RoninRequest() : RoninRequest {
    return Ronin.CurrentRequest
  }

  static property get Request() : HttpServletRequest {
    return Ronin.CurrentRequest?.HttpRequest
  }

  static property get Response() : HttpServletResponse {
    return Ronin.CurrentRequest?.HttpResponse
  }

  static property get Writer() : Writer {
    return Response?.Writer
  }

  static property get Method() : HttpMethod {
    return Ronin.CurrentRequest?.HttpMethod
  }

  static property get Session() : Map<String, Object> {
    return Ronin.CurrentRequest?.HttpSession
  }

  static property get Referrer() : String {
    return Ronin.CurrentRequest?.Referrer
  }

  static property get XSRFTokenName() : String {
    return "__ronin_XSRF"
  }

  static property get XSRFTokenValue() : String {
    if(Session[XSRFTokenName] != null) {
      return URLEncoder.encode(Session[XSRFTokenName] as String)
    }
    var token = new String(MessageDigest.getInstance("SHA1").digest((Request.Session.Id + System.currentTimeMillis()).Bytes))
    Session[XSRFTokenName] = token
    return URLEncoder.encode(token)
  }
}