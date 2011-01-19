package ronin.config

uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse

uses ronin.*

/**
 *  Represents an object responsible for handling errors which occur while processing a request.
 */
interface IErrorHandler {

  /**
   *  Handles a 404 error (not found).
   *  @param e The exception which caused this error.
   *  @param req The HTTP request.
   *  @param resp The pending HTTP response.
   */
  function on404(e : FourOhFourException, req : HttpServletRequest, resp : HttpServletResponse)

  /**
   *  Handles a 500 error (internal server error).
   *  @param e The exception which caused this error.
   *  @param req The HTTP request.
   *  @param resp The pending HTTP response.
   */
  function on500(e : FiveHundredException, req : HttpServletRequest, resp : HttpServletResponse)

}