package ronin.test

uses ronin.*

uses java.io.IOException
uses java.util.Arrays
uses java.util.Map

uses javax.servlet.ServletException

uses gw.test.TestClass

abstract class RoninTest extends TestClass {

  static var _servlet : RoninServlet
  static var _config : TestServletConfig

  override function beforeTestClass() {
    super.beforeTestClass()
    _servlet = new RoninServlet(false)
    _config = new TestServletConfig()
    _servlet.init(_config)
  }

  private function handle(url : String, params : Map<String, String[]>, method : HttpMethod) : TestHttpResponse {
    var req = new TestHttpRequest()
    var resp = new TestHttpResponse()
    req.Scheme = "http"
    req.ServerName = "localhost"
    req.ServerPort = 80
    req.ContextPath = ""
    req.ServletPath = ""
    req.ServletContext = _config.ServletContext
    if(url.contains("?")) {
        req.PathInfo = url.substring(0, url.indexOf("?"))
        var paramsInUrl = url.substring(url.indexOf("?") + 1).split("&")
        for(param in paramsInUrl) {
            params.put(param.substring(0, param.indexOf("=")), {param.substring(param.indexOf("=") + 1)})
        }
    } else {
      req.PathInfo = url
    }
    req.ParameterMap = params
    _servlet.handleRequest( req, resp, method )
    return resp
  }

  protected function get(url : String) : TestHttpResponse {
    return get(url, {})
  }

  protected function get(url : String, params : Map<String, String[]>) : TestHttpResponse {
    return handle(url, params, GET)
  }

  protected function post(url : String) : TestHttpResponse {
    return post(url, {})
  }

  protected function post(url : String, params : Map<String, String[]>) : TestHttpResponse {
    return handle(url, params, POST)
  }

  protected function put(url : String) : TestHttpResponse {
    return put(url, {})
  }

  protected function put(url : String, params : Map<String, String[]>) : TestHttpResponse {
    return handle(url, params, PUT)
  }

  protected function delete(url : String) : TestHttpResponse {
    return delete(url, {})
  }

  protected function delete(url : String, params : Map<String, String[]>) : TestHttpResponse {
    return handle(url, params, DELETE)
  }

}