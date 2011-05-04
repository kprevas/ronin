package ronin.config

uses java.io.PrintWriter

/**
 *  Represents an object responsible for handling values returned by controller methods.
 */
interface IReturnValueHandler {

  /**
   *  Handles the value returned by a controller method, usually by writing it to the given writer somehow.
   *  @param rtn The value returned by the controller method.
   *  @param writer The writer to which any output should be written.
   */
  function handleReturnValue(rtn : Object, writer : PrintWriter)

}