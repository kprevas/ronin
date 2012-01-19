package controller

class CacheTest extends ronin.RoninController {

  function fromReqCache(i:int) : String {
    return requestCache(i) + "" + requestCache(i+1)
  }

  function fromSessionCache(i:int) : String {
    return sessionCache(i) + "" + sessionCache(i+1)
  }

  function fromApplicationCache(i:int) : String {
    return applicationCache(i) + "" + applicationCache(i+1)
  }

  function clearSessionCache() : String {
    invalidate( "Session Cache", ronin.Ronin.CacheStore.SESSION )
    return "done"
  }

  function clearApplicationCache() : String {
    invalidate( "App Cache", ronin.Ronin.CacheStore.APPLICATION )
    return "done"
  }

  private function requestCache( i : int ) : int {
    return cache( \->i )
  }

  private function sessionCache( i : int ) : int {
    return cache( \->i, "Session Cache", ronin.Ronin.CacheStore.SESSION )
  }

  private function applicationCache( i : int ) : int {
    return cache( \->i, "App Cache", ronin.Ronin.CacheStore.APPLICATION )
  }
}