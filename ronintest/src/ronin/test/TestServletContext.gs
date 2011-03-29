package ronin.test

uses java.io.*
uses java.net.*
uses java.util.*
uses java.util.concurrent.*
uses java.lang.*
uses javax.servlet.*
uses javax.servlet.descriptor.*

internal class TestServletContext implements ServletContext {

  override property get ContextPath() : String {
    return ""
  }

  override function getContext(s : String) : ServletContext {
    return null
  }

  override property get MajorVersion() : int {
    return 0
  }

  override property get MinorVersion() : int {
    return 0
  }

  override property get EffectiveMajorVersion() : int {
    return 0
  }

  override property get EffectiveMinorVersion() : int {
    return 0
  }

  override function getMimeType(s : String) : String {
    return s
  }

  override function getResource(s : String) : URL {
    return null
  }

  override function getResourceAsStream(s : String) : InputStream {
    return null
  }

  override function getRequestDispatcher(s : String) : RequestDispatcher {
    return null
  }

  override function getNamedDispatcher(s : String) : RequestDispatcher {
    return null
  }
  
  override function getServlet(s : String) : Servlet {
    return null
  }

  override property get Servlets() : Enumeration<Servlet> {
    return null
  }

  override property get ServletNames() : Enumeration<String> {
    return null
  }
  
  override function log(s : String) {}
  override function log(e : Exception, s : String) {}
  override function log(s : String, t : Throwable) {}

  override function getRealPath(s : String) : String {
    return s
  }
  
  override property get ServerInfo() : String {
    return ""
  }

  override function getInitParameter(s : String) : String {
    return null
  }
  
  override property get InitParameterNames() : Enumeration<String> {
    return null
  }

  var _attributes = new ConcurrentHashMap<String, Object>()

  override function getAttribute(s : String) : Object {
    return _attributes[s]
  }
  
  override property get AttributeNames() : Enumeration<String> {
    return null
  }

  override function setAttribute(s : String, o : Object) {
    _attributes[s] = o
  }

  override function removeAttribute(s : String) {
    _attributes.remove(s)
  }

  override property get ServletContextName() : String {
    return "Ronin test servlet context"
  }

  override property get ClassLoader() : ClassLoader {
    return null
  }

  override property get DefaultSessionTrackingModes() : Set<SessionTrackingMode> {
    return null
  }

  override property get EffectiveSessionTrackingModes() : Set<SessionTrackingMode> {
    return null
  }

  override property get FilterRegistrations() : Map<String, FilterRegistration> {
    return null
  }

  override property get JspConfigDescriptor() : JspConfigDescriptor {
    return null
  }

  override property get ServletRegistrations() : Map<String, ServletRegistration> {
    return null
  }

  override property get SessionCookieConfig() : SessionCookieConfig {
    return null
  }

  override function addFilter(s : String, f : Filter) : FilterRegistration.Dynamic {
    return null
  }

  override function addFilter(s : String, f : Class<Filter>) : FilterRegistration.Dynamic {
    return null
  }

  override function addFilter(s : String, f : String) : FilterRegistration.Dynamic {
    return null
  }

  override function addServlet(s : String, f : Servlet) : ServletRegistration.Dynamic {
    return null
  }

  override function addServlet(s : String, f : Class<Servlet>) : ServletRegistration.Dynamic {
    return null
  }

  override function addServlet(s : String, f : String) : ServletRegistration.Dynamic {
    return null
  }

  override function addListener(s : String) {
  
  }

  override function addListener(s : Class<EventListener>) {

  }

  override function addListener<T extends EventListener>(s : T) {

  }

  override function createFilter<T extends Filter>(s : Class<T>) : T {
    return null
  }

  override function createListener<T extends EventListener>(s : Class<T>) : T {
    return null
  }

  override function createServlet<T extends Servlet>(s : Class<T>) : T {
    return null
  }

  override function declareRoles(s : String[]) {}

  override function getFilterRegistration(s : String) : FilterRegistration {
    return null
  }

  override function getResourcePaths(s : String) : Set<String> {
    return null
  }

  override function getServletRegistration(s : String) : ServletRegistration {
    return null
  }

  override function setInitParameter(s1 : String, s2 : String) : boolean {
    return false
  }

  override function setSessionTrackingModes(s : Set<SessionTrackingMode>) {}
}