package ronin.ws

uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse

interface IWSWrapper {

  function addWebService(typeName : String)

  function listServices(response : HttpServletResponse, path : String)

  function service(req : HttpServletRequest, resp : HttpServletResponse)

}