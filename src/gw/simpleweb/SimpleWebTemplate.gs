package gw.simpleweb

uses java.util.*

class SimpleWebTemplate {

    static function h(x : String) : String {
      return x == null ? "" :
        x.replace("&", "&amp;")
         .replace("<", "&lt;")
         .replace(">", "&gt;")
         .replace("\"", "&quot;")
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

}