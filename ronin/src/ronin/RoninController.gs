package ronin

uses gw.lang.reflect.features.*
uses java.io.Writer
uses java.util.Map
uses java.lang.ThreadLocal
uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse

/**
 *  Subclasses of this class are responsible for handling Ronin requests.
 */
class RoninController implements IRoninUtils {

    /**
     *  Sends a redirect to the user's browser.  It is recommended to return from your controller method
     *  immediately after calling this method.
     *  @param target If the redirect is followed, it will have the effect of calling this method.  Arguments
     *  must be bound.
     */
    @URLMethodValidator
    static function redirect(target : MethodReference) {
      Response.sendRedirect(URLUtil.urlFor(target))
    }

    @URLMethodValidator
    @Deprecated("Block-based methods have been deprecated.  Use urlFor(Foo#bar()) instead.")
    static function redirect(target() : void) {
      Response.sendRedirect(URLUtil.urlFor(target))
    }

    /**
     *  Sends a redirect to the user's browser which returns the user to the referring URL.  If no referring
     *  URL is present, or a redirect loop would result, attempts to redirect the user to the default controller
     *  and action.
     */
    static function bounce() {
      var redirectTo = Referrer
      var currentUrl = Request.RequestURL
      if(Request.QueryString?.HasContent) {
        currentUrl.append("?").append(Request.QueryString)
      }
      if(redirectTo == null or redirectTo == currentUrl.toString()) {
        Response.sendRedirect(Request.RootURL)
      } else {
        Response.sendRedirect(redirectTo)
      }
    }

    /**
     *  Executed before every request handled by this controller.
     *  @param params The parameters which will be passed to the controller method.
     *  @return False if the request should be aborted before the controller method is called.
     */
    protected function beforeRequest(params : Map<String, Object>) : boolean {
      return true
    }

    /**
     *  Executed after every request handled by this controller.
     *  @param params The parameters which were passed to the controller method.
     */
    protected function afterRequest(params : Map<String, Object>) {

    }
    
}