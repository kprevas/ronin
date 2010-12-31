package ronin.config

interface ILogHandler {

  function log(msg : Object, level : LogLevel, component : String, exception : java.lang.Throwable)

}