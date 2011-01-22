package ronin

uses java.util.concurrent.ConcurrentHashMap

uses ronin.config.LogLevel

uses org.slf4j.*
uses org.slf4j.impl.StaticLoggerBinder

class RoninLoggerFactory implements ILoggerFactory {

  static function init(level : LogLevel) {
    StaticLoggerBinder.getSingleton().LoggerFactory = new RoninLoggerFactory(){:Level = level}
  }

  var _level : LogLevel as Level
  var _loggers = new ConcurrentHashMap<String, Logger>()

  override function getLogger(name : String) : Logger {
    var logger = _loggers[name]
    if(logger == null) {
      logger = new RoninLogger() {:Name = name, :Level = _level}
      _loggers[name] = logger
    }
    return logger
  }

}