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
