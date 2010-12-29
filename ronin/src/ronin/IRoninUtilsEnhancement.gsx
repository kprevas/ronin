package ronin

uses ronin.config.*

enhancement IRoninUtilsEnhancement: IRoninUtils {

  static function log( msg : Object, level : LogLevel = null, component : String = null, exception : java.lang.Throwable = null) {
    RoninServlet.ServletInstance._log( msg, level, component, exception)
  }

  static function trace( msg : Object, printTiming : boolean = true ) : Trace.TraceElement {
    return RoninServlet.ServletInstance.CurrentTrace?.withMessage( msg, printTiming )
  }

  static function cache<T>( value : block():T, name : String = null, store : RoninServlet.CacheStore = null ) : T {
    return RoninServlet.ServletInstance._cache( value, name, store )
  }

  static function invalidate( name : String, store : RoninServlet.CacheStore ) {
    RoninServlet.ServletInstance._invalidate( name, store )
  }

}