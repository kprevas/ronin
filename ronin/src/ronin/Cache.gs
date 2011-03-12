package ronin

uses ronin.config.*
uses java.util.*
uses java.util.concurrent.*
uses java.util.concurrent.locks.*
uses gw.util.concurrent.*
uses java.lang.*

/**
 *  A general-purpose, threadsafe cache for use in Ronin apps.
 */
class Cache {

  static final var NULL_SENTINEL : Object = new Object()

  var _store : CacheStore as Store

  /**
   *  @param s The object responsible for storing cached values.
   */
  construct(s : CacheStore) {
    Store = s
  }

  /**
   *  Retrieves a value, or computes and stores it if it hasn't been cached yet.
   *  @param value A block which computes the value when invoked.
   *  @param name A unique identifier for the value.
   *  @return The retrieved or computed value.
   */
  function getValue<T>(value : block():T, name : String = null) : T {
    var cacheName = makeCacheName(value, name)
    return findInStore(name, value)
  }

  /**
   *  Invalidates a cached value.
   *  @param name The identifier under which the value was stored.
   */
  function invalidate<T>(name : String = null) {
    using(store.Lock?.writeLock()) {
      Store.saveValue(name, null)
    }
  }

  private function findInStore<T>(name : String, blk : block():T):T {
    var value : Object = null
    using(Store.Lock?.readLock()) {
      value = Store.loadValue(name)
    }
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

  private function makeCacheName(value : Object, name : String) : String {
    if(name != null) {
      return name
    } else {
      return "__ronincache__" + value.Class.getName()
    }
  }

  /**
   *  An object responsible for storing and retrieving cached values.
   */
  interface CacheStore {

    /**
     *  The read-write lock for this store.
     */
    property get Lock() : ReadWriteLock

    /**
     *  Retrieves a value from the store.
     *  @param key The key used to identify the desired value.
     *  @return The retrieved value.
     */
    function loadValue(key : String) : Object

    /**
     *  Stores a value in the store.
     *  @param key The key under which to store the value.
     *  @param value The value to store.
     */
    function saveValue(key : String, value : Object)

  }
}