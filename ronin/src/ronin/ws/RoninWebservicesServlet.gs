package ronin.ws

uses javax.servlet.http.HttpServlet
uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse
uses javax.servlet.http.HttpSession

uses ronin.*

class RoninWebservicesServlet {

  var _main : RoninServlet
  var _wsWrapper : IWSWrapper

  construct (mainServlet : RoninServlet) {
    _main = mainServlet
    _wsWrapper = initWrapper()
    for(t in Ronin.Config.Webservices) {
      _wsWrapper?.addWebService(t.Name)
    }
  }

  function handles(req : HttpServletRequest) : boolean {
    return req?.PathInfo?.startsWith("/webservices") or
           req?.PathInfo?.startsWith("/resources.dftree/")
  }

  function handle(req : HttpServletRequest, resp : HttpServletResponse) {
    if (_wsWrapper == null) {
      throw "Webservices are not supported without the Gosu webservices jars"
    }
    if (req?.PathInfo == "/webservices") {
      var contextPath = req.ContextPath
      if( not contextPath.startsWith( "/" ) ) {
        contextPath = "/" + contextPath
      }
      _wsWrapper.listServices(resp, contextPath)
    } else {
      _wsWrapper.service(req, resp);
    }
  }

  final function initWrapper() : IWSWrapper {
    var wrapperType = gw.lang.reflect.TypeSystem.getByFullNameIfValid( "ronin.ws.WSWrapper" )
    if(wrapperType != null) {
      return wrapperType.TypeInfo.getConstructor( {} ).Constructor.newInstance( {} ) as IWSWrapper
    } else {
      return null
    }
  }

}