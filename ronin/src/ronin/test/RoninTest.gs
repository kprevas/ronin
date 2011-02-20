package ronin.test

uses ronin.*
uses ronin.config.*

uses java.io.IOException
uses java.util.Arrays
uses java.util.Map

uses org.junit.Assert

uses gw.lang.reflect.features.MethodReference

uses javax.servlet.ServletException
uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse
uses org.apache.commons.fileupload.servlet.*

uses gw.util.concurrent.LazyVar

/**
 *  A utility class for running integration tests on a Ronin application.
 */
class RoninTest {

  static var _config = new TestServletConfig()
  static var _rawConfig : IRoninConfig
  /**
   *  The application's raw configuration object.  (RoninTest wraps this in its own
   *  configuration object, which is what {@link ronin.Ronin#Config} will return during
   *  a test.)
   */
  static property get RawConfig() : IRoninConfig { return _rawConfig }

  static var _session = new TestHttpSession()

  static var _servlet = LazyVar.make(\ -> {
    var servlet = new RoninServlet(ApplicationMode.TESTING.ShortName)
    _rawConfig = Ronin.Config
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

  /**
   *  Performs a GET request to the specified URL.
   *  @param url A URL, relative to the servlet root.
   *  @return An object representing the application's response.
   */
  static function get(url : String) : TestHttpResponse {
    return get(url, {})
  }

  /**
   *  Performs a GET request which will call the specified controller method.
   *  @param url A method reference to a controller method, with bound arguments.
   *  @return An object representing the application's response.
   */
  @URLMethodValidator
  static function get(method : MethodReference) : TestHttpResponse {
    var url : String
    using(request()) {
      url = URLUtil.urlFor(method)
    }
    return get(url.substring("http://localhost".Length))
  }

  /**
   *  Performs a GET request to the specified URL.
   *  @param url A URL, relative to the servlet root.
   *  @param params A map of parameters to include in the request, as if they were appended to the URL.
   *  @return An object representing the application's response.
   */
  static function get(url : String, params : Map<String, String[]>) : TestHttpResponse {
    return handle(url, params, null, null, GET, null)
  }

  /**
   *  Performs a GET request to the specified URL with the given request content.
   *  @param url A URL, relative to the servlet root.
   *  @param content The content of the request body.
   *  @param contentType The content type of the request body.
   *  @return An object representing the application's response.
   */
  static function get(url : String, content : String, contentType : String) : TestHttpResponse {
    return handle(url, {}, content, contentType, GET, null)
  }

  /**
   *  Performs a POST request to the specified URL.
   *  @param url A URL, relative to the servlet root.
   *  @return An object representing the application's response.
   */
  static function post(url : String) : TestHttpResponse {
    return post(url, {})
  }

  /**
   *  Performs a POST request to the specified URL.
   *  @param url A URL, relative to the servlet root.
   *  @param params A map of parameters to include in the request, e.g. from an HTML form.
   *  @return An object representing the application's response.
   */
  static function post(url : String, params : Map<String, String[]>) : TestHttpResponse {
    return handle(url, params, null, null, POST, null)
  }

  /**
   *  Performs a POST request to the specified URL with the given request content.
   *  @param url A URL, relative to the servlet root.
   *  @param content The content of the request body.
   *  @param contentType The content type of the request body.
   *  @return An object representing the application's response.
   */
  static function post(url : String, content : String, contentType : String) : TestHttpResponse {
    return handle(url, {}, content, contentType, POST, null)
  }

  /**
   *  Performs a POST request to the specified URL, including one or more file uploads.
   *  @param url A URL, relative to the servlet root.
   *  @param params A map of parameters to include in the request, e.g. from an HTML form, excluding the file uploads.
   *  @param files A map from file upload names to the byte-level contents of the files.
   *  @return An object representing the application's response.
   */
  static function postWithFiles(url : String, params : Map<String, String[]>, files : Map<String, byte[]>) : TestHttpResponse {
    return handle(url, params, null, "multipart/mixed", POST, files)
  }

  /**
   *  Performs a PUT request to the specified URL.
   *  @param url A URL, relative to the servlet root.
   *  @return An object representing the application's response.
   */
  static function put(url : String) : TestHttpResponse {
    return put(url, {})
  }

  /**
   *  Performs a PUT request to the specified URL.
   *  @param url A URL, relative to the servlet root.
   *  @param params A map of parameters to include in the request, e.g. from an HTML form.
   *  @return An object representing the application's response.
   */
  static function put(url : String, params : Map<String, String[]>) : TestHttpResponse {
    return handle(url, params, null, null, PUT, null)
  }

  /**
   *  Performs a PUT request to the specified URL with the given request content.
   *  @param url A URL, relative to the servlet root.
   *  @param content The content of the request body.
   *  @param contentType The content type of the request body.
   *  @return An object representing the application's response.
   */
  static function put(url : String, content : String, contentType : String) : TestHttpResponse {
    return handle(url, {}, content, contentType, PUT, null)
  }

  /**
   *  Performs a DELETE request to the specified URL.
   *  @param url A URL, relative to the servlet root.
   *  @return An object representing the application's response.
   */
  static function delete(url : String) : TestHttpResponse {
    return delete(url, {})
  }

  /**
   *  Performs a DELETE request to the specified URL.
   *  @param url A URL, relative to the servlet root.
   *  @param params A map of parameters to include in the request, e.g. from an HTML form.
   *  @return An object representing the application's response.
   */
  static function delete(url : String, params : Map<String, String[]>) : TestHttpResponse {
    return handle(url, params, null, null, DELETE, null)
  }

  /**
   *  Performs a DELETE request to the specified URL with the given request content.
   *  @param url A URL, relative to the servlet root.
   *  @param content The content of the request body.
   *  @param contentType The content type of the request body.
   *  @return An object representing the application's response.
   */
  static function delete(url : String, content : String, contentType : String) : TestHttpResponse {
    return handle(url, {}, content, contentType, DELETE, null)
  }

  /**
   *  Simulates the context set up by a Ronin request without actually making a request.
   *  Use the return value of this method in a using() block to write unit-level tests of
   *  code which requires a request context.
   */
  static function request() : RoninRequest {
    return new RoninRequest("http://localhost/", initResponse(), initRequest(), GET, new SessionMap(_session), null)
  }

  /**
   *  Clears the HTTP session.
   */
  static function clearSession() {
    _session = new TestHttpSession()
  }

  /**
   *  Asserts that a response is a redirect.
   *  @param response An HTTP response.
   *  @param url (Optional) A URL (relative to the servlet root) to assert that the response redirects to.
   *  Default is null, which means the assertion passes on any redirect.
   */
  static function assertRedirect(response : TestHttpResponse, url : String = null) {
    Assert.assertNotNull(response.Redirect)
    if(url != null) {
      Assert.assertEquals(url, response.Redirect.substring("http://localhost".Length))
    }
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