package ronin.test

uses ronin.*
uses ronin.config.*

uses java.io.IOException
uses java.util.Arrays
uses java.util.Map

uses javax.servlet.ServletException
uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse

uses gw.util.concurrent.LazyVar

class RoninTest {

  static var _config = new TestServletConfig()

  static var _servlet = LazyVar.make(\ -> {
    var servlet = new RoninServlet(false)
    Ronin.Config = new TestConfig(Ronin.Config)
    servlet.init(_config)
    return servlet
  })

  private static function handle(url : String, params : Map<String, String[]>, content : String, contentType : String, method : HttpMethod) : TestHttpResponse {
    var req = new TestHttpRequest()
    var resp = new TestHttpResponse()
    req.Scheme = "http"
    req.ServerName = "localhost"
    req.ServerPort = 80
    req.ContextPath = ""
    req.ServletPath = ""
    req.ServletContext = _config.ServletContext
    req.Content = content
    req.ContentType = contentType ?: "application/x-www-form-urlencoded"
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
    _servlet.get().handleRequest(req, resp, method)
    return resp
  }

  static function get(url : String) : TestHttpResponse {
    return get(url, {})
  }

  static function get(url : String, params : Map<String, String[]>) : TestHttpResponse {
    return handle(url, params, null, null, GET)
  }

  static function get(url : String, content : String, contentType : String) : TestHttpResponse {
    return handle(url, {}, content, contentType, GET)
  }

  static function post(url : String) : TestHttpResponse {
    return post(url, {})
  }

  static function post(url : String, params : Map<String, String[]>) : TestHttpResponse {
    return handle(url, params, null, null, POST)
  }

  static function post(url : String, content : String, contentType : String) : TestHttpResponse {
    return handle(url, {}, content, contentType, POST)
  }

  static function put(url : String) : TestHttpResponse {
    return put(url, {})
  }

  static function put(url : String, params : Map<String, String[]>) : TestHttpResponse {
    return handle(url, params, null, null, PUT)
  }

  static function put(url : String, content : String, contentType : String) : TestHttpResponse {
    return handle(url, {}, content, contentType, PUT)
  }

  static function delete(url : String) : TestHttpResponse {
    return delete(url, {})
  }

  static function delete(url : String, params : Map<String, String[]>) : TestHttpResponse {
    return handle(url, params, null, null, DELETE)
  }

  static function delete(url : String, content : String, contentType : String) : TestHttpResponse {
    return handle(url, {}, content, contentType, DELETE)
  }

  private static class TestConfig implements IRoninConfig {
    delegate _cfg : IRoninConfig represents IRoninConfig

    construct(cfg : IRoninConfig) {
      _cfg = cfg
    }

    override property get ErrorHandler() : IErrorHandler {
      return new IErrorHandler() {
        override function on404(e : FourOhFourException, req : HttpServletRequest, resp : HttpServletResponse) {
          throw e
        }    
        override function on500(e : FiveHundredException, req : HttpServletRequest, resp : HttpServletResponse) {
          throw e
        }
      }
    }

  }

}