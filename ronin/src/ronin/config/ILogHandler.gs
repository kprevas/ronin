package ronin.config

interface ILogHandler {

  function log( msg : Object, level : LogLevel, category : String, exception : java.lang.Throwable )

}