package ronin

uses gw.lang.reflect.features.*
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

    static function urlFor(target : MethodReference) : String {
      return URLUtil.urlFor(target)
    }

    static function postUrlFor(target : MethodReference) : String {
      return URLUtil.baseUrlFor(target)
    }

    @URLMethodValidator
    @Deprecated("Block-based methods have been deprecated.  Use urlFor(Foo#bar()) instead.")
    static function urlFor( target() : void ) : String {
      return URLUtil.urlFor(target)
    }

    @Deprecated("IMethodInfo-based methods have been deprecated.  Use postUrlFor(Foo#bar()) instead.")
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