package ronin

uses ronin.config.*
uses java.util.*
uses java.util.concurrent.*
uses java.util.concurrent.locks.*
uses gw.util.concurrent.*
uses java.lang.*

class Cache {

  public static final var NULL_SENTINEL : Object = new Object()

  var _store : CacheStore as Store

  construct(s : CacheStore) {
    Store = s
  }

  function getValue<T>(value : block():T, name : String = null) : T {
    var cacheName = makeCacheName(value, name)
    return findInStore(name, value)
  }

  function invalidate<T>(name : String = null) {
    using(store.Lock?.writeLock()) {
      Store.saveValue(name, null)
    }
  }

  private function findInStore<T>(name : String, blk : block():T):T {
    using(Store.Lock?.readLock()) {
      var value = Store.loadValue(name)
      if(value == null) {
        using(Store.Lock?.writeLock()) {
          value = Store.loadValue(name)
          if(value == null) {
            value = blk()
            if(value == null) {
              value = NULL_SENTINEL
            }
            Store.saveValue(name, value)
          }
        }
      }
      if(value == NULL_SENTINEL) {
        return null
      } else {
        return value as T
      }
    }
  }

  private function makeCacheName(value : Object, name : String) : String {
    if(name != null) {
      return name
    } else {
      return "__ronincache__" + value.Class.getName()
    }
  }

  interface CacheStore {

    property get Lock() : ReadWriteLock

    function loadValue(key : String) : Object

    function saveValue(key : String, value : Object)

  }
}