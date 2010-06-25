package ronin

uses java.util.*
uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse

class SimpleWebTemplate {

    static function h(x : String) : String {
      return x == null ? "" :
        x.replace("&", "&amp;")
         .replace("<", "&lt;")
         .replace(">", "&gt;")
         .replace("\"", "&quot;")
    }
    
    static function g(x : String) : String {
      return x == null ? "" :
        x.replace("\"", "\\\"")
         .replace("\<%", "\\\<%")
         .replace("\${", "\\\${")
    }

    @URLMethodValidator
    static function urlFor( target() : void ) : String {
      return URLUtil.urlFor(target)
    }

    static function postUrlFor( target : gw.lang.reflect.IMethodInfo) : String {
      return URLUtil.baseUrlFor(target)
    }
    
    static property get session() : Map<String, Object> {
      return SimpleWebController.session
    }

    static property get request() : HttpServletRequest {
      return SimpleWebController.request
    }

    static property get response() : HttpServletResponse {
      return SimpleWebController.response
    }

}