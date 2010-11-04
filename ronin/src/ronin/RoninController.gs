package ronin

uses java.io.Writer
uses java.util.Map
uses java.lang.ThreadLocal
uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse

class RoninController {
 
    static var _writer : ThreadLocal<Writer> = new ThreadLocal<Writer>()

    static property get writer() : Writer {
       return _writer.get()
    }

    static property set writer(aWriter : Writer) {
       _writer.set(aWriter)
    }

    static var _resp : ThreadLocal<HttpServletResponse> = new ThreadLocal<HttpServletResponse>()

    static property get response() : HttpServletResponse {
       return _resp.get()
    }
    
    static property set response(aResponse : HttpServletResponse) {
       _resp.set(aResponse)
    }

    static var _req : ThreadLocal<HttpServletRequest> = new ThreadLocal<HttpServletRequest>()

    static property get request() : HttpServletRequest {
       return _req.get()
    }
    
    static property set request(aRequest : HttpServletRequest) {
       _req.set(aRequest)
    }

    static var _method : ThreadLocal<HttpMethod> = new ThreadLocal<HttpMethod>()

    static property get method() : HttpMethod {
       return _method.get()
    }
    
    static property set method(aMethod : HttpMethod) {
       _method.set(aMethod)
    }

    static var _sessionMap : ThreadLocal<Map<String, Object>> = new ThreadLocal<Map<String, Object>>()

    static property get session() : Map<String, Object> {
      return _sessionMap.get()
    }

    static property set session(aSession : Map<String, Object>) {
      _sessionMap.set(aSession)
    }
    
    static var _referrer : ThreadLocal<String> = new ThreadLocal<String>()
    
    static property get referrer() : String {
      return _referrer.get()
    }
    
    static property set referrer(areferrer : String) {
      _referrer.set(areferrer)
    }
    
    @URLMethodValidator
    static function redirect(target() : void) {
      _resp.get().sendRedirect(URLUtil.urlFor(target))
    }
    
    static function bounce() {
      // TODO what to do on null referrer?
      _resp.get().sendRedirect(referrer)
    }
    
}