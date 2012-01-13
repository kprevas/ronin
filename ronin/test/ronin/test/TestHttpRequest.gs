package ronin.test

uses java.io.*
uses java.lang.*
uses java.util.*
uses java.security.*
uses javax.servlet.*
uses javax.servlet.http.*

internal class TestHttpRequest implements HttpServletRequest {

  var _authType : String as AuthType
  var _cookies : Cookie[] as Cookies
  var _dateHeaders : Map<String, Long> as DateHeaders
  var _attributes : Map<String, Object> as Attributes
  var _headers : Map<String, List<String>> as Headers
  var _intHeaders : Map<String, Integer> as IntHeaders
  var _method : String as Method
  var _pathInfo : String as PathInfo
  var _contextPath : String as ContextPath
  var _queryString : String as QueryString
  var _remoteUser : String as RemoteUser
  var _principal : Principal as UserPrincipal
  var _requestedSessionId : String as RequestedSessionId
  var _session : HttpSession as Session
  var _servletPath : String as ServletPath
  var _characterEncoding : String as CharacterEncoding
  var _content : String as Content
  var _contentType : String as ContentType
  var _parameters : Map<String, String[]> as ParameterMap
  var _protocol : String as Protocol
  var _scheme : String as Scheme
  var _serverName : String as ServerName
  var _serverPort : int as ServerPort
  var _remoteAddr : String as RemoteAddr
  var _remoteHost : String as RemoteHost
  var _remotePort : int as RemotePort
  var _localAddr : String as LocalAddr
  var _localName : String as LocalName
  var _localPort : int as LocalPort
  var _locale : Locale as Locale
  var _secure : boolean as Secure
  var _asyncContext : AsyncContext as AsyncContext
  var _asyncStarted : boolean as AsyncStarted
  var _asyncSupported : boolean as AsyncSupported
  var _dispatcherType : DispatcherType as DispatcherType
  var _servletContext : ServletContext as ServletContext
  var _parts : Collection<Part> as Parts

  construct() {
    _dateHeaders = {}
    _headers = {}
    _intHeaders = {}
    _parameters = {}
    _cookies = {}
    _attributes = {}
  }

  override function getDateHeader(s : String) : long {
    return _dateHeaders[s]
  }

  override function getHeader(s : String) : String {
    var h = _headers[s]
    return h?.get(0)
  }

  override function getHeaders(s : String) : Enumeration<String> {
    return new IteratorEnumeration<String>() {:It = _headers[s].iterator()}
  }

  override property get HeaderNames() : Enumeration<String> {
    return new IteratorEnumeration<String>() {:It = _headers.keySet().iterator()}
  }

  override function getIntHeader(s : String) : int {
    return _intHeaders[s]
  }

  override property get PathTranslated() : String {
    return _pathInfo
  }

  override function isUserInRole(s : String) : boolean {
    return false
  }
  
  override property get RequestURI() : String {
    return "${Scheme}://${ServerName}${ServerPort == 80 ? "" : (":" + ServerPort)}${ContextPath}${ServletPath}/${PathInfo}"
  }

  override property get RequestURL() : StringBuffer {
    return new StringBuffer(RequestURI)
  }

  override function getSession(b : boolean) : HttpSession {
    return Session
  }

  override property get RequestedSessionIdValid() : boolean {
    return false
  }

  override property get RequestedSessionIdFromCookie() : boolean {
    return false
  }

  override property get RequestedSessionIdFromURL() : boolean {
    return false
  }

  override property get RequestedSessionIdFromUrl() : boolean {
    return false
  }

  override function getAttribute(s : String) : Object {
    return Attributes[s]
  }

  override property get AttributeNames() : Enumeration<String> {
    return null
  }

  override property get ContentLength() : int {
    return _content.length
  }

  override property get InputStream() : ServletInputStream {
    return new ServletStringStream(_content)
  }

  override function getParameter(s : String) : String {
    return _parameters[s] == null ? null : _parameters[s][0]
  }

  override property get ParameterNames() : Enumeration<String> {
    return new IteratorEnumeration<String>() {:It = _parameters.keySet().iterator()}
  }

  override function getParameterValues(s : String) : String[] {
    return _parameters[s]
  }

  override property get Reader() : BufferedReader {
    return new BufferedReader(new StringReader(_content))
  }

  override function setAttribute(s : String, o : Object) {
    Attributes[s] = o
  }

  override function removeAttribute(s : String) {
    Attributes.remove(s)
  }
  
  override property get Locales() : Enumeration<Locale> {
    return new IteratorEnumeration<Locale>() {:It = {_locale}.iterator()}
  }
  
  override function getRequestDispatcher(s : String) : RequestDispatcher {
    return null
  }

  override function getRealPath(s : String) : String {
    return s
  }

  override function startAsync() : AsyncContext {
    return null
  }

  override function startAsync(req : ServletRequest, resp : ServletResponse) : AsyncContext {
    return null
  }

  override function authenticate(resp : HttpServletResponse) : boolean {
    return false
  }

  override function getPart(s : String) : Part {
    return null
  }

  override function login(s : String, s2 : String) {}
  override function logout() {}

  private class ServletStringStream extends ServletInputStream {
    var _delegate : InputStream

    construct(s : String) {
      _delegate = new ByteArrayInputStream(s.Bytes)
    }

    override function read() : int {
      return _delegate.read()
    }
  }

}