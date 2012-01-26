package ronin

uses java.lang.*
uses java.util.*
uses javax.servlet.*
uses javax.servlet.http.*

/**
 *  An implementation of {@link java.util.Map} which delegates to an HTTP session.
 */
class SessionMap implements Map<String, Object> {

  var _session : HttpSession

  construct(session : HttpSession) {
    _session = session
  }

  override function clear() {
    throw new UnsupportedOperationException()
  }

  override function containsKey(key : Object) : boolean {
    var keys = _session?.AttributeNames
    while(keys.hasMoreElements()) {
      if(keys.nextElement() as Object == key) {
        return true
      }
    }
    return false
  }

  override function containsValue(value : Object) : boolean {
    var keys = _session?.AttributeNames
    while(keys?.hasMoreElements()) {
      if(_session.getAttribute(keys.nextElement() as String) == value) {
        return true
      }
    }
    return false
  }

  override function entrySet() : Set<Map.Entry<String, Object>> {
    throw new UnsupportedOperationException()
  }

  override function get(key : Object) : Object {
    return _session?.getAttribute(key as String)
  }

  override property get Empty() : boolean {
    return _session?.AttributeNames?.hasMoreElements()
  }

  override function keySet() : Set<String> {
    throw new UnsupportedOperationException()
  }

  override function put(key : String, value : Object) : Object {
    var oldVal = _session?.getAttribute(key)
    _session?.setAttribute(key, value)
    return oldVal
  }

  override function putAll(m : Map<String, Object>) {
    m.eachKeyAndValue(\ k, v -> put(k, v))
  }

  override function remove(key : Object) : Object {
    var oldVal = _session?.getAttribute(key as String)
    _session?.removeAttribute(key as String)
    return oldVal
  }

  override function size() : int {
    var count = 0
    var keys = _session?.AttributeNames
    while(keys.hasMoreElements()) {
      keys.nextElement()
      count++
    }
    return count
  }

  override function values() : Collection<Object> {
    throw new UnsupportedOperationException()
  }

}