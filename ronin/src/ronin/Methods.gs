package ronin

uses gw.lang.IAnnotation

class Methods implements IAnnotation {

  var _methods : List<HttpMethod> as Methods

  construct(__methods : List<HttpMethod>) {
    _methods = __methods
  }

}