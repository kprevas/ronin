package gw.simpleweb

uses java.io.IOException
uses java.util.Arrays
uses java.util.Map

uses javax.servlet.ServletException

uses gw.test.TestClass

uses servletunit.*

abstract class SimpleWebTest extends TestClass {

  var _servlet : SimpleWebServlet
  var _config : ServletConfigSimulator

  override function beforeTestClass() {
    super.beforeTestClass()
    _servlet = new SimpleWebServlet(true)
    _config = new ServletConfigSimulator()
    _servlet.init(_config)
  }
  
  private function handle(url : String, params : Map<String, String>, method : HttpMethod) : HttpServletResponseSimulator {
    var req = new HttpServletRequestSimulator(_config.ServletContext)
    var resp = new HttpServletResponseSimulator()
    req.Scheme = "http"
    req.ServerName = "localhost"
    req.ServerPort = 80
    if(url.contains("?")) {
        req.PathInfo = url.substring(0, url.indexOf("?"))
        var paramsInUrl = url.substring(url.indexOf("?") + 1).split("&")
        for(param in paramsInUrl) {
            params.put(param.substring(0, param.indexOf("=")), param.substring(param.indexOf("=") + 1))
        }
    } else {
	    req.PathInfo = url
    }
    params.eachKeyAndValue( \ k, v -> req.addParameter(k, v) )
    _servlet.handleRequest( req, resp, method )
    return resp
  }
  
  protected function get(url : String) : HttpServletResponseSimulator {
    return get(url, {})
  }
  
  protected function get(url : String, params : Map<String, String>) : HttpServletResponseSimulator {
    return handle(url, params, GET)
  }

  protected function post(url : String) : HttpServletResponseSimulator {
    return post(url, {})
  }
  
  protected function post(url : String, params : Map<String, String>) : HttpServletResponseSimulator {
    return handle(url, params, POST)
  }

  protected function put(url : String) : HttpServletResponseSimulator {
    return put(url, {})
  }
  
  protected function put(url : String, params : Map<String, String>) : HttpServletResponseSimulator {
    return handle(url, params, PUT)
  }

  protected function delete(url : String) : HttpServletResponseSimulator {
    return delete(url, {})
  }
  
  protected function delete(url : String, params : Map<String, String>) : HttpServletResponseSimulator {
    return handle(url, params, DELETE)
  }

}
