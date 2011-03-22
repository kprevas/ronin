package ronin

uses gw.lang.IAnnotation
uses gw.lang.annotation.*

@AnnotationUsage(MethodTarget, One)
class NoAuth implements IAnnotation {

}