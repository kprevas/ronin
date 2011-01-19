package ronin.config

/**
 *  Represents an object responsible for logging messages produced by the application.
 */
interface ILogHandler {

  /**
   *  Logs a message.
   *  @param msg The text of the message.
   *  @param level The log level at which to log the message.
   *  @param component A String representing the logical component from whence the message originated.
   *  @param exception An exception to associate with the message.
   */
  function log(msg : Object, level : LogLevel, component : String, exception : java.lang.Throwable)

}