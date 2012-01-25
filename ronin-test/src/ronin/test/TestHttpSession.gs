package ronin.test

uses java.lang.*
uses java.util.*

uses javax.servlet.*
uses javax.servlet.http.*

internal class TestHttpSession implements HttpSession {

  var _creationTime : long as CreationTime
  var _id : String as Id
  var _lastAccessedTime : long as LastAccessedTime
  var _servletContext : ServletContext as ServletContext
  var _maxInactiveInterval : int as MaxInactiveInterval
  var _sessionContext : HttpSessionContext as SessionContext

  var _map : Map<String, Object> = {}

  override function getAttribute(s : String) : Object {
    return _map[s]
  }

  override function getValue(s : String) : Object {
    return getAttribute(s)
  }

  override property get AttributeNames() : Enumeration<String> {
    return new IteratorEnumeration<String>(){:It = _map.keySet().iterator()}
  }

  override property get ValueNames() : String[] {
    return _map.keySet().toTypedArray()
  }

  override function setAttribute(s : String, o : Object) {
    _map[s] = o
  }

  override function putValue(s : String, o : Object) {
    setAttribute(s, o)
  }

  override function removeAttribute(s : String) {
    _map.remove(s)
  }

  override function removeValue(s : String) {
    removeAttribute(s)
  }

  override property get New() : boolean {
    return false
  }

  override function invalidate() {}
}