package ronin.config

uses ronin.*
uses org.apache.commons.fileupload.servlet.*
uses javax.servlet.Filter

interface IRoninConfig {

  property get RoninServlet() : RoninServlet

  property get RequestCache() : Cache
  property get SessionCache() : Cache
  property get ApplicationCache() : Cache

  property get Mode() : ApplicationMode
  property get LogLevel() : LogLevel
  property get TraceEnabled() : boolean

  property get DefaultAction() : String
  property get DefaultController() : Type

  property get XSRFLevel() : List<HttpMethod>

  property get ServletFileUpload() : ServletFileUpload

  property get AuthManager() : IAuthManager

  property get Filters() : List<Filter>

  // handlers
  property get ErrorHandler() : IErrorHandler
  property get LogHandler() : ILogHandler

}