package ronin

uses java.util.*
uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse

class RoninTemplate {

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
    
    static property get Session() : Map<String, Object> {
      return RoninController.Session
    }

    static property get Request() : HttpServletRequest {
      return RoninController.Request
    }

    static property get Response() : HttpServletResponse {
      return RoninController.Response
    }

}