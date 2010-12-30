package ronin.config

uses ronin.*

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

  // handlers
  property get ErrorHandler() : IErrorHandler
  property get LogHandler() : ILogHandler

}