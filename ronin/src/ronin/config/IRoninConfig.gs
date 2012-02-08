package ronin.config

uses ronin.*
uses java.util.*
uses gw.lang.reflect.*
uses gw.lang.reflect.features.*
uses org.apache.commons.fileupload.servlet.*
uses javax.servlet.Filter

/**
 *  The central location for application-wide configuration options.
 */
interface IRoninConfig {

  /**
   *  The servlet responsible for handling Ronin requests.
   */
  property get RoninServlet() : RoninServlet

  /**
   *  The request-level cache.
   */
  property get RequestCache() : Cache
  /**
   *  The session-level cache.
   */
  property get SessionCache() : Cache
  /**
   *  The application-level cache.
   */
  property get ApplicationCache() : Cache

  /**
   *  The mode in which the application is running.
   */
  property get Mode() : ApplicationMode
  /**
   *  The log level at and above which log messages should be displayed.
   */
  property get LogLevel() : LogLevel
  /**
   *  Whether or not to display detailed trace information on each request.
   */
  property get TraceEnabled() : boolean

  /**
   *  The default controller method to call when no method name is present in the request URL.
   */
  property get DefaultAction() : String
  /**
   *  The default controller to call when no controller name is present in the request URL.
   */
  property get DefaultController() : Type

  /**
   *  A list of HTTP methods to which XSRF protection should be applied.
   */
  property get XSRFLevel() : List<HttpMethod>

  /**
   *  The handler for file uploads.
   */
  property get ServletFileUpload() : ServletFileUpload

  /**
   *  The user authentication and authorization handler.
   */
  property get AuthManager() : IAuthManager

  /**
   *  A list of servlet filters to apply to each request that reaches the Ronin servlet.
   */
  property get Filters() : List<Filter>

  /**
   *  The handler for request processing errors.
   */
  property get ErrorHandler() : IErrorHandler
  /**
   *  A custom handler for logging messages instead of using the SLF4J logging API.
   */
  property get LogHandler() : ILogHandler

  /**
   *  The object responsible for finding a controller method given a URL.
   */
  property get URLHandler() : IURLHandler

  /**
   *  The object responsible for handling values returned from controller methods.
   */
  property get ReturnValueHandler() : IReturnValueHandler

  /**
   *  The object responsible for converting parameters from strings in the HTTP request to the types expected
   *  by the controller method.
   */
  property get ParamConverter() : IParamConverter

  /**
   *  Properties which should never be set via request parameters.
   */
  property get RestrictedProperties() : Set<PropertyReference>

  /**
   *  Controller method to redirect to if a user is not logged in.
   */
  property get LoginRedirect() : MethodReference

  /**
   *  Initializes a servlet filter with a default filter configuration and returns it.
   */
  function initFilter(filter : Filter) : Filter

}