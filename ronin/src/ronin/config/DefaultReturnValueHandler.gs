package ronin.config

uses java.io.PrintWriter

/**
 *  Default implementation of {@link ronin.config.IReturnValueHandler}.  Simply writes the return value to the output
 *  if and only if it's a String.
 */
class DefaultReturnValueHandler implements IReturnValueHandler {

  override function handleReturnValue(rtn : Object, writer : PrintWriter) {
    if(rtn typeis String) {
     writer.write(rtn)
    }
  }

}