package ronin.config

uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse

uses ronin.*

interface IErrorHandler {

  function on404(e : FourOhFourException, req : HttpServletRequest, resp : HttpServletResponse)

  function on500(e : FiveHundredException, req : HttpServletRequest, resp : HttpServletResponse)

}