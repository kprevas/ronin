package ronin

uses ronin.config.*
uses java.util.*
uses java.util.concurrent.*
uses java.util.concurrent.locks.*
uses java.util.concurrent.atomic.*
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
    using(Ronin.CurrentTrace?.withMessage("Cache Load ${cacheName}")) {
      return findInStore(cacheName, value)
    }
  }

  /**
   *  Invalidates a cached value.
   *  @param name The identifier under which the value was stored.
   */
  function invalidate(name : String) {
    using(Store.Lock?.writeLock()) {
      var cachedValue = Store.loadValue(name) as CachedValue
      if(cachedValue != null) {
        Ronin.log("CACHE INVALIDATE : ${name}, req:${cachedValue.Requests.get()}, misses:${cachedValue.Misses.get()}", DEBUG, "Ronin Cache")
        cachedValue.Value = null
      }
    }
  }

  private function findInStore<T>(name : String, blk : block():T):T {

    var cachedValue : CachedValue<T>
    var value : Object = null

    using(Store.Lock?.readLock()) {
      cachedValue = Store.loadValue(name) as CachedValue<T>
      value = cachedValue?.Value
    }

    if(value == null) {
      using(Store.Lock?.writeLock()) {
        cachedValue = Store.loadValue(name) as CachedValue<T>
        if(cachedValue == null) {
          cachedValue = new CachedValue<T>()
          Store.saveValue(name, cachedValue)
        }
        value = cachedValue.Value
        if(value == null) {
          value = blk()
          if(value == null) {
            value = NULL_SENTINEL
          }
          cachedValue.Value = value as T
          cachedValue.Requests.incrementAndGet()
          cachedValue.Misses.incrementAndGet()
          if(Ronin.CurrentTrace != null and !name.startsWith("__ronin__")) {
            Ronin.CurrentTrace?.addMessage("CACHE MISS : ${name}, req:${cachedValue.Requests.get()}, misses:${cachedValue.Misses.get()}")
          }
        }
      }
    } else {
      cachedValue.Requests.incrementAndGet()
      if(Ronin.CurrentTrace != null and !name.startsWith("__ronin__")) {
        Ronin.CurrentTrace?.addMessage("CACHE HIT : ${name}, req:${cachedValue.Requests.get()}, misses:${cachedValue.Misses.get()}")
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

  static class CachedValue<Q> {
    var _requests : AtomicInteger as Requests = new AtomicInteger()
    var _misses : AtomicInteger as Misses = new AtomicInteger()
    var _value : Q as Value

    override function toString() : String {
      return "{ req: ${Requests.get()}, misses: ${Misses.get()}, value:${Value} }"
    }
  }

}