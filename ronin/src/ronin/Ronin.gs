package ronin

uses gw.lang.reflect.*
uses java.lang.*
uses ronin.config.*

class Ronin {

  // One static field to rule the all...
  static var _CONFIG : IRoninConfig as Config

  // And one thread local to bind them
  static var _CURRENT_REQUEST = new ThreadLocal<RoninRequest>();

  // That's inconstructable
  private construct() {}

  internal static function init(servlet : RoninServlet, devMode : boolean) {
    if(_CONFIG != null) {
      throw "Cannot initialize a Ronin application multiple times!"
    }
    var m : ApplicationMode = devMode ? DEVELOPMENT : PRODUCTION
    var cfg = TypeSystem.getByFullNameIfValid("config.RoninConfig")
    if(cfg != null) {
      var ctor = cfg.TypeInfo.getConstructor({ronin.config.ApplicationMode, ronin.RoninServlet})
      if(ctor == null) {
        throw "config.RoninConfig must have a constructor with the same signature as ronin.config.RoninConfig"
      }
      _CONFIG = ctor.Constructor.newInstance({m, servlet}) as IRoninConfig
    } else {
      _CONFIG = new DefaultRoninConfig(m, servlet)
      //log("No configuration was found at config.RoninConfig, using the default configuration...", :level=WARN)
    }
  }

  internal static property set CurrentRequest(req : RoninRequest) {
    _CURRENT_REQUEST.set(req)
  }

  //============================================
  // Public API
  //============================================

  static property get CurrentTrace() : Trace {
    return CurrentRequest?.Trace
  }

  static property get CurrentRequest() : RoninRequest {
    return _CURRENT_REQUEST.get()
  }

  static property get Mode() : ApplicationMode {
    return _CONFIG.Mode
  }

  static property get LogLevel() : LogLevel {
    return _CONFIG.LogLevel
  }

  static property get TraceEnabled() : boolean {
    return _CONFIG.TraceEnabled
  }

  static property get DefaultAction() : String {
    return _CONFIG.DefaultAction
  }

  static property get DefaultController() : Type {
    return _CONFIG.DefaultController
  }

  static property get RoninServlet() : RoninServlet {
    return _CONFIG.RoninServlet
  }

  static property get ErrorHandler() : IErrorHandler {
    return _CONFIG.ErrorHandler
  }

  static property get LogHandler() : ILogHandler {
    return _CONFIG.LogHandler  
  }

  static function log(msg : Object, level : LogLevel = null, component : String = null, exception : java.lang.Throwable = null) {
    if(level == null) {
      level = INFO
    }
    if(LogLevel <= level) {
      if(msg typeis block():String) {
        msg = (msg as block():String)()
      }
      _CONFIG.LogHandler.log(msg, level, component, exception)
    }
  }

  static enum CacheStore {
    REQUEST,
    SESSION,
    APPLICATION
  }

  static function cache<T>(value : block():T, name : String = null, store : CacheStore = null) : T {
    if(store == null or store == REQUEST) {
      return _CONFIG.RequestCache.getValue(value, name)
    } else if (store == SESSION) {
      return _CONFIG.SessionCache.getValue(value, name)
    } else if (store == APPLICATION) {
      return _CONFIG.ApplicationCache.getValue(value, name)
    } else {
      throw "Don't know about CacheStore ${store}"
    }
  }

  static function invalidate<T>(name : String, store : CacheStore) {
    if(store == null or store == REQUEST) {
      _CONFIG.RequestCache.invalidate(name)
    } else if (store == SESSION) {
      _CONFIG.SessionCache.invalidate(name)
    } else if (store == APPLICATION) {
      _CONFIG.ApplicationCache.invalidate(name)
    } else {
      throw "Don't know about CacheStore ${store}"
    }
  }

}