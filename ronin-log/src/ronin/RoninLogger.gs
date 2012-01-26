package ronin

uses java.lang.*
uses org.slf4j.*
uses org.slf4j.helpers.*
uses ronin.config.LogLevel

internal class RoninLogger extends MarkerIgnoringBase {

  static final var LINE_SEPARATOR = System.getProperty("line.separator");
  static final var startTime = System.currentTimeMillis()

  var _name : String as Name
  var _level : LogLevel as Level

  override property get TraceEnabled() : boolean {
    return _level <= LogLevel.TRACE
  }

  override function trace(msg : String) {
    log(TRACE, msg)
  }

  override function trace(format : String, param1 : Object) {
    formatAndLog(TRACE, format, param1, null)
  }
  
  override function trace(format : String, param1 : Object, param2 : Object) {
    formatAndLog(TRACE, format, param1, param2)  
  }
  
  override function trace(format : String, argArray : Object[]) {
    formatAndLog(TRACE, format, argArray)
  }
  
  override function trace(msg : String, t : Throwable) {
    log(TRACE, msg, t)
  }

  override property get DebugEnabled() : boolean {
    return _level <= LogLevel.DEBUG
  }

  override function debug(msg : String) {
    log(DEBUG, msg)
  }

  override function debug(format : String, param1 : Object) {
    formatAndLog(DEBUG, format, param1, null)
  }
  
  override function debug(format : String, param1 : Object, param2 : Object) {
    formatAndLog(DEBUG, format, param1, param2)  
  }
  
  override function debug(format : String, argArray : Object[]) {
    formatAndLog(DEBUG, format, argArray)
  }
  
  override function debug(msg : String, t : Throwable) {
    log(DEBUG, msg, t)
  }

  override property get InfoEnabled() : boolean {
    return _level <= LogLevel.INFO
  }

  override function info(msg : String) {
    log(INFO, msg)
  }

  override function info(format : String, param1 : Object) {
    formatAndLog(INFO, format, param1, null)
  }
  
  override function info(format : String, param1 : Object, param2 : Object) {
    formatAndLog(INFO, format, param1, param2)  
  }
  
  override function info(format : String, argArray : Object[]) {
    formatAndLog(INFO, format, argArray)
  }
  
  override function info(msg : String, t : Throwable) {
    log(INFO, msg, t)
  }

  override property get WarnEnabled() : boolean {
    return _level <= LogLevel.WARN
  }

  override function warn(msg : String) {
    log(WARN, msg)
  }

  override function warn(format : String, param1 : Object) {
    formatAndLog(WARN, format, param1, null)
  }
  
  override function warn(format : String, param1 : Object, param2 : Object) {
    formatAndLog(WARN, format, param1, param2)  
  }
  
  override function warn(format : String, argArray : Object[]) {
    formatAndLog(WARN, format, argArray)
  }
  
  override function warn(msg : String, t : Throwable) {
    log(WARN, msg, t)
  }

  override property get ErrorEnabled() : boolean {
    return _level <= LogLevel.ERROR
  }

  override function error(msg : String) {
    log(ERROR, msg)
  }

  override function error(format : String, param1 : Object) {
    formatAndLog(ERROR, format, param1, null)
  }
  
  override function error(format : String, param1 : Object, param2 : Object) {
    formatAndLog(ERROR, format, param1, param2)  
  }
  
  override function error(format : String, argArray : Object[]) {
    formatAndLog(ERROR, format, argArray)
  }
  
  override function error(msg : String, t : Throwable) {
    log(ERROR, msg, t)
  }

  private function log(l : LogLevel, msg : String, t : Throwable = null) {
    var buf = new StringBuffer()
    var millis = System.currentTimeMillis()
    buf.append(millis - startTime)
    buf.append("[").append(Thread.currentThread().Name).append("]")
    buf.append(l.Name).append(" ")
    buf.append(Name).append(" - ")
    buf.append(msg)
    buf.append(LINE_SEPARATOR)

    System.err.print(buf.toString());
    if (t != null) {
      t.printStackTrace(System.err);
    }
    System.err.flush();
  }

  private function formatAndLog(l : LogLevel, format : String, arg1 : Object, arg2 : Object) {
    var tp = MessageFormatter.format(format, arg1, arg2)
    log(l, tp.Message, tp.Throwable)
  }

  private function formatAndLog(l : LogLevel, format : String, argArray : Object[]) {
    var tp = MessageFormatter.format(format, argArray)
    log(l, tp.Message, tp.Throwable)
  }

}