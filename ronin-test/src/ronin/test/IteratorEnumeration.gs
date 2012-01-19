package ronin.test

uses java.lang.*
uses java.util.*

internal class IteratorEnumeration<E> implements Enumeration<E> {
  var _it : Iterator<E> as It
  override function hasMoreElements() : boolean {
   return _it.hasNext()
  }
  override function nextElement() : E {
   return it.next()
  }
}

