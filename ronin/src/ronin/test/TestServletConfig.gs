package ronin.test

uses java.lang.*
uses java.util.*
uses javax.servlet.*

internal class TestServletConfig implements ServletConfig {

  var _initParameters : Map<String, String> as InitParameters
  var _ctx = new TestServletContext()

  override function getInitParameter(s : String) : String {
    return _initParameters[s]
  }

  override property get InitParameterNames() : Enumeration<String> {
    return new IteratorEnumeration<String>() {:It = _initParameters.keySet().iterator()}
  }

  override property get ServletName() : String {
    return "Ronin test servlet"
  }

  override property get ServletContext() : ServletContext {
    return _ctx
  }

}