package gw.simpleweb

uses java.io.IOException
uses java.util.Arrays
uses java.util.Map

uses javax.servlet.ServletException

uses servletunit.HttpServletRequestSimulator
uses servletunit.HttpServletResponseSimulator
uses servletunit.ServletConfigSimulator
uses servletunit.ServletContextSimulator

uses gw.test.TestClass

abstract class SimpleWebTest extends TestClass {

  construct(name : String) {
    super(name)
  }

  var _servlet : SimpleWebServlet

  protected override function beforeTestClass() {
    super.beforeTestClass()
    _servlet = new SimpleWebServletWrapper()
    var servletConfigSimulator = new ServletConfigSimulator()
    (servletConfigSimulator.ServletContext as ServletContextSimulator).ContextDirectory = CurrentTestDir
    _servlet.init(servletConfigSimulator)
  }

  protected function get(url : String, params : Map<String, String>) : HttpServletResponseSimulator {
    var resp = new HttpServletResponseSimulator()
    var req = new HttpServletRequestSimulator(_servlet.ServletContext)
    req.Method = 0
    req.ServerName = "testserver"
    req.ServerPort = 80
    req.ServletPath = "/servletpath"
    req.PathInfo = url
    for (param in params.entrySet()) {
      req.addParameter(param.Key, param.Value)
    }
    _servlet.doGet(req, resp)
    return resp
  }

  protected function post(url : String, params : Map<String, String>) : HttpServletResponseSimulator {
    var resp = new HttpServletResponseSimulator()
    var req = new HttpServletRequestSimulator(_servlet.ServletContext)
    req.Method = 1
    req.ServerName = "testserver"
    req.ServerPort = 80
    req.ServletPath = "/servletpath"
    req.PathInfo = url
    for (param in params.entrySet()) {
      req.addParameter(param.Key, param.Value)
    }
    _servlet.doPost(req, resp)
    return resp
  }

  protected function put(url : String, params : Map<String, String>) : HttpServletResponseSimulator {
    var resp = new HttpServletResponseSimulator()
    var req = new HttpServletRequestSimulator(_servlet.ServletContext)
    req.Method = 1
    req.ServerName = "testserver"
    req.ServerPort = 80
    req.ServletPath = "/servletpath"
    req.PathInfo = url
    for (param in params.entrySet()) {
      req.addParameter(param.Key, param.Value)
    }
    _servlet.doPut(req, resp)
    return resp
  }

  protected function delete(url : String, params : Map<String, String>) : HttpServletResponseSimulator {
    var resp = new HttpServletResponseSimulator()
    var req = new HttpServletRequestSimulator(_servlet.ServletContext)
    req.Method = 1
    req.ServerName = "testserver"
    req.ServerPort = 80
    req.ServletPath = "/servletpath"
    req.PathInfo = url
    for (param in params.entrySet()) {
      req.addParameter(param.Key, param.Value)
    }
    _servlet.doDelete(req, resp)
    return resp
  }

}
