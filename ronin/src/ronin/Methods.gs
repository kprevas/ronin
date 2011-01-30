package ronin

uses gw.lang.IAnnotation
uses gw.lang.annotation.*

@AnnotationUsage(MethodTarget, One)
class Methods implements IAnnotation {

  var _methods : List<HttpMethod> as PermittedMethods

  construct(methods : List<HttpMethod>) {
    _methods = methods
  }

}