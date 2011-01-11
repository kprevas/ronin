package ronin

uses java.util.*
uses java.io.*

uses javax.servlet.http.*

uses gw.lang.reflect.features.*

class RoninRequest implements gw.lang.IReentrant {

  var _prefix : String as readonly Prefix
  var _resp : HttpServletResponse as readonly HttpResponse
  var _req : HttpServletRequest as readonly HttpRequest
  var _method : HttpMethod as readonly HttpMethod
  var _sessionMap : Map<String, Object> as readonly HttpSession
  var _referrer : String as readonly Referrer
  var _trace : Trace as readonly Trace
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
    if(Ronin.Mode == DEVELOPMENT) {
      _trace = new Trace()
    }
  }

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

  function beforeRenderTemplate(template : Type) {
    if(Ronin.TraceEnabled) {
      var elt = Ronin.CurrentTrace.withMessage(template.Name + ".render()")
      elt.enter()
      _templateTraceStack.push(elt)
    }
  }

  function afterRenderTemplate(template : Type) {
    if(Ronin.TraceEnabled) {
      var elt = _templateTraceStack.pop()
      elt.exit()
    }
  }

  function checkXSRF() {
    if(_sessionMap[IRoninUtils.XSRFTokenName] != null) {
      if(_req.getParameter(IRoninUtils.XSRFTokenName) != _sessionMap[IRoninUtils.XSRFTokenName] as String) {
        throw "Missing or invalid authenticity token."
      }
    }
  }

}