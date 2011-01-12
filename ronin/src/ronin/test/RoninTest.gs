package ronin.test

uses ronin.*
uses ronin.config.*

uses java.io.IOException
uses java.util.Arrays
uses java.util.Map

uses javax.servlet.ServletException
uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse
uses org.apache.commons.fileupload.servlet.*

uses gw.util.concurrent.LazyVar

class RoninTest {

  static var _config = new TestServletConfig()

  static var _session = new TestHttpSession()

  static var _servlet = LazyVar.make(\ -> {
    var servlet = new RoninServlet(false)
    Ronin.Config = new TestConfig(Ronin.Config)
    servlet.init(_config)
    return servlet
  })

  static var _servletFileUpload = new TestServletFileUpload()

  internal static function handle(url : String, params : Map<String, String[]>, content : String, contentType : String, method : HttpMethod, files : Map<String, byte[]>, authentic : boolean = true) : TestHttpResponse {
    _servlet.get()
    _servletFileUpload.Files = files
    var req = initRequest()
    req.Method = method as String
    req.Content = content
    req.ContentType = contentType ?: "application/x-www-form-urlencoded"
    var resp = initResponse()
    if(url.contains("?")) {
        req.PathInfo = url.substring(0, url.indexOf("?"))
        var paramsInUrl = url.substring(url.indexOf("?") + 1).split("&")
        for(param in paramsInUrl) {
            params.put(param.substring(0, param.indexOf("=")), {param.substring(param.indexOf("=") + 1)})
        }
    } else {
      req.PathInfo = url
    }
    if(authentic and Ronin.Config.XSRFLevel.contains(method) and _session.getAttribute(IRoninUtils.XSRFTokenName) != null) {
      using(request()) {
        params[IRoninUtils.XSRFTokenName] = {IRoninUtils.XSRFTokenValue}
      }
    }
    req.ParameterMap = params
    _servlet.get().handleRequest(req, resp, method)
    return resp
  }

  static function get(url : String) : TestHttpResponse {
    return get(url, {})
  }

  static function get(url : String, params : Map<String, String[]>) : TestHttpResponse {
    return handle(url, params, null, null, GET, null)
  }

  static function get(url : String, content : String, contentType : String) : TestHttpResponse {
    return handle(url, {}, content, contentType, GET, null)
  }

  static function post(url : String) : TestHttpResponse {
    return post(url, {})
  }

  static function post(url : String, params : Map<String, String[]>) : TestHttpResponse {
    return handle(url, params, null, null, POST, null)
  }

  static function post(url : String, content : String, contentType : String) : TestHttpResponse {
    return handle(url, {}, content, contentType, POST, null)
  }

  static function postWithFiles(url : String, params : Map<String, String[]>, files : Map<String, byte[]>) : TestHttpResponse {
    return handle(url, params, null, "multipart/mixed", POST, files)
  }

  static function put(url : String) : TestHttpResponse {
    return put(url, {})
  }

  static function put(url : String, params : Map<String, String[]>) : TestHttpResponse {
    return handle(url, params, null, null, PUT, null)
  }

  static function put(url : String, content : String, contentType : String) : TestHttpResponse {
    return handle(url, {}, content, contentType, PUT, null)
  }

  static function delete(url : String) : TestHttpResponse {
    return delete(url, {})
  }

  static function delete(url : String, params : Map<String, String[]>) : TestHttpResponse {
    return handle(url, params, null, null, DELETE, null)
  }

  static function delete(url : String, content : String, contentType : String) : TestHttpResponse {
    return handle(url, {}, content, contentType, DELETE, null)
  }

  static function request() : RoninRequest {
    return new RoninRequest("http://localhost/", initResponse(), initRequest(), GET, new SessionMap(_session), null)
  }

  static function clearSession() {
    _session = new TestHttpSession()
  }

  private static function initRequest() : TestHttpRequest {
    var req = new TestHttpRequest() {:Session = _session}
    req.Scheme = "http"
    req.ServerName = "localhost"
    req.ServerPort = 80
    req.ContextPath = ""
    req.ServletPath = ""
    req.ServletContext = _config.ServletContext
    return req
  }

  private static function initResponse() : TestHttpResponse {
    return new TestHttpResponse()
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

    override property get ServletFileUpload() : ServletFileUpload {
      return _servletFileUpload
    }

  }

}