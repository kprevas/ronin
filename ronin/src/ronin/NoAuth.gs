package ronin

uses gw.lang.IAnnotation
uses gw.lang.annotation.*

@AnnotationUsage(MethodTarget, One)
@AnnotationUsage(TypeTarget, One)
class NoAuth implements IAnnotation {

}