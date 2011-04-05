package ronin

uses java.util.*
uses java.io.*

uses javax.servlet.http.*

uses gw.lang.reflect.features.*

/**
 *  Ronin's representation of a request.
 */
class RoninRequest implements gw.lang.IReentrant {

  /**
   *  The part of the request URL before the controller.
   */
  var _prefix : String as readonly Prefix
  /**
   *  The HTTP response object.
   */
  var _resp : HttpServletResponse as readonly HttpResponse
  /**
   *  The HTTP request object.
   */
  var _req : HttpServletRequest as readonly HttpRequest
  /**
   *  The method of the HTTP request.
   */
  var _method : HttpMethod as readonly HttpMethod
  /**
   *  The HTTP session, as a Map.
   */
  var _sessionMap : Map<String, Object> as readonly HttpSession
  /**
   *  The referring URL given by the request.
   */
  var _referrer : String as readonly Referrer
  /**
   *  The trace handler for the request.
   */
  var _trace : Trace as readonly Trace
  /**
   *  The target URL of a form, inside a using(target()) block in a template.
   *  @see ronin.RoninTemplate#target(MethodReference)
   */
  var _formTarget : MethodReference as FormTarget

  var _templateTraceStack = new gw.util.Stack<Trace.TraceElement>()
  var _parentRequest : RoninRequest

  construct(pref : String, resp : HttpServletResponse, req : HttpServletRequest, method : HttpMethod, sessionMap : Map<String, Object>, ref : String) {
    _prefix = pref
    _resp = resp
    _req = req
    _method = method
    _sessionMap = sessionMap
    _referrer = ref
    if(Ronin.TraceEnabled) {
      _trace = new Trace()
    }
  }

  /**
   *  The output writer of the response.
   */
  property get Writer() : Writer {
     return _resp.Writer
  }

  override function enter() {
    _parentRequest = Ronin.CurrentRequest
    Ronin.CurrentRequest = this
  }
  
  override function exit() {
    Ronin.CurrentRequest = _parentRequest
  }

  internal function beforeRenderTemplate(template : Type) {
    if(Ronin.TraceEnabled) {
      var elt = Ronin.CurrentTrace.withMessage(template.Name + ".render()")
      elt.enter()
      _templateTraceStack.push(elt)
    }
  }

  internal function afterRenderTemplate(template : Type) {
    if(Ronin.TraceEnabled) {
      var elt = _templateTraceStack.pop()
      elt.exit()
    }
  }

  internal function checkXSRF() {
    if(_sessionMap[IRoninUtils.XSRFTokenName] != null) {
      if(_req.getParameter(IRoninUtils.XSRFTokenName) != _sessionMap[IRoninUtils.XSRFTokenName] as String) {
        throw "Missing or invalid authenticity token."
      }
    }
  }

}