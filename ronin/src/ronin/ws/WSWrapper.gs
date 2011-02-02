package ronin.ws

uses javax.servlet.http.HttpServlet
uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse
uses javax.servlet.http.HttpSession

uses gw.internal.xml.ws.server.ServletWebservicesResponse
uses gw.internal.xml.ws.server.WebservicesResponse
uses gw.internal.xml.ws.server.WebservicesServletBase

class WSWrapper extends WebservicesServletBase implements IWSWrapper {

  override function addWebService(typeName : String) {
    super.addWebService(typeName)
  }

  override function listServices(response : HttpServletResponse, path : String) {
    super.doGetIndex(new ServletWebservicesResponse(response), path)
  }

  override function service(req : HttpServletRequest, resp : HttpServletResponse) {
    super.service(req, resp)
  }
}