package gw.simpleweb

uses java.io.Writer
uses java.util.Map
uses javax.servlet.http.HttpServletResponse

class SimpleWebController {

    static var _writer request : Writer

    static property get writer() : Writer {
       return _writer
    }

    static property set writer(aWriter : Writer) {
       _writer = aWriter
    }

    static var _resp request : HttpServletResponse

    static property get response() : HttpServletResponse {
       return _resp
    }
    
    static property set response(aResponse : HttpServletResponse) {
       _resp = aResponse
    }

    static var _method request : HttpMethod

    static property get method() : HttpMethod {
       return _method
    }
    
    static property set method(aMethod : HttpMethod) {
       _method = aMethod
    }

    static var _sessionMap request : Map<String, Object>;

    static property get session() : Map<String, Object> {
      return _sessionMap
    }

    static property set session(aSession : Map<String, Object>) {
      _sessionMap = aSession
    }
    
    @URLMethodValidator
    static function redirect(target() : void) {
        _resp.sendRedirect(URLUtil.urlFor(target))
    }
    
}