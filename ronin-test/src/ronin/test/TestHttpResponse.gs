package ronin.test

uses java.io.*
uses java.lang.*
uses java.util.*
uses java.security.*
uses javax.servlet.*
uses javax.servlet.http.*

/**
 *  An HTTP response as returned by methods on {@link ronin.test.RoninTest}.
 */
class TestHttpResponse implements HttpServletResponse {

  var _cookies : List<Cookie> as Cookies
  var _headers : Map<String, String> as Headers
  var _status : int as Status
  var _error : String as Error
  var _redirect : String as Redirect
  var _dateHeaders : Map<String, Long> as DateHeaders
  var _intHeaders : Map<String, Integer> as IntHeaders
  var _characterEncoding : String as CharacterEncoding
  var _contentType : String as ContentType
  var _contentLength : int
  var _bufferSize : int as BufferSize
  var _locale : Locale as Locale

  /**
   *  The raw response buffer.  Call toString() on this to get the text of the response.
   */
  var _writer : StringWriter as WriterBuffer
  var _writerWrapper : PrintWriter as Writer
  var _outputStream : ServletOutputStream

  construct() {
    _writer = new StringWriter()
    _writerWrapper = new PrintWriter(_writer)
    _outputStream = new ServletStringStream()
    _dateHeaders = {}
    _headers = {}
    _intHeaders = {}
    _cookies = {}
    _status = 200
  }

  property get ContentLength() : int {
    return _contentLength
  }

  override function setContentLength(i : int) {
    _contentLength = i
  }

  override function addCookie(cookie : Cookie) {
    _cookies.add(cookie)
  }

  override function containsHeader(s : String) : boolean {
    return _headers.keySet().contains(s)
  }

  override function encodeUrl(s : String) : String {
    return s
  }

  override function encodeRedirectUrl(s : String) : String {
    return s
  }

  override function sendError(i : int, s : String) {
    _status = i
    _error = s
  }

  override function sendError(i : int) {
    _status = i
  }

  override function sendRedirect(s : String) {
    _redirect = s
  }

  override function setDateHeader(s : String, l : long) {
    _dateHeaders[s] = l
  }

  override function addDateHeader(s : String, l : long) {
    _dateHeaders[s] = l
  }

  override function setHeader(s : String, s1 : String) {
    _headers[s] = s1
  }

  override function addHeader(s : String, s1 : String) {
    _headers[s] = s1
  }

  override function setIntHeader(s : String, i : int) {
    _intHeaders[s] = i
  }

  override function addIntHeader(s : String, i : int) {
    _intHeaders[s] = i
  }

  override function setStatus(i : int, s : String) {
    _status = i
    _error = s
  }

  override function flushBuffer() {

  }

  override function resetBuffer() {

  }

  override property get Committed() : boolean {
    return false
  }

  override function reset() {

  }

  override property get OutputStream() : ServletOutputStream {
    return _outputStream
  }

  override property get HeaderNames() : Collection<String> {
    return _headers.keySet()
  }

  override function getHeader(s : String) : String {
    return _headers[s]
  }
  
  override function getHeaders(s : String) : Collection<String> {
    return {_headers[s]}
  }

  private class ServletStringStream extends ServletOutputStream {
    var _delegate = new ByteArrayOutputStream()

    override function write(b : int) {
      _delegate.write(b)
    }
  }

}