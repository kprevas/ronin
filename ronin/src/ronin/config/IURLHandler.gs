package ronin.config

uses gw.lang.reflect.IMethodInfo

/**
 *  Represents an object responsible for locating a controller method given a URL.
 */
interface IURLHandler {

  /**
   *  Finds the appropriate controller method for handling a URL.
   *  @param request The relevant part of the URL as an array of Strings (obtained by splitting the request
   *  URL on the slash character.
   *  @return The method info object for the controller method to call.
   */
  function getControllerMethod(request : String[]) : IMethodInfo

}