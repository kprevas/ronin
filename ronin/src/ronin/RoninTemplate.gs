package ronin

uses gw.lang.reflect.features.*
uses gw.lang.*
uses java.util.*
uses java.lang.*
uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse

class RoninTemplate {

    static var TRACE = new ThreadLocal<Stack<Long>>()

    static function beforeRender( template : gw.lang.reflect.IType, writer : java.io.Writer ) {
      if(RoninServlet.Instance.TraceEnabled) {
        RoninServlet.Instance.CurrentTrace.Depth++
        TraceStack.push( System.nanoTime() )
      }
    }

    static function afterRender( temp : gw.lang.reflect.IType, writer : java.io.Writer ) {
      if(RoninServlet.Instance.TraceEnabled) {
        var startTime = TraceStack.pop()
        var totalTime = (System.nanoTime() - startTime) / 1000000;
        RoninServlet.Instance.CurrentTrace.addElement(temp.Name + ".render() - " + totalTime + " ms ", INFO, "RoninTemplate")
        RoninServlet.Instance.CurrentTrace.Depth--
      }
    }

    private static property get TraceStack() : Stack<Long> {
      var stack = TRACE.get()
      if(stack == null) {
        stack = new Stack<Long>()
        TRACE.set(stack)
      }
      return stack
    }

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