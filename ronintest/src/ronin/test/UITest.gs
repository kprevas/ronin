package ronin.test

uses gw.lang.IAnnotation
uses gw.lang.annotation.*

/**
 * Use this annotation on tests which require a full server to be running (e.g. browser-based tests).
 */
@AnnotationUsage(TypeTarget, One)
class UITest implements IAnnotation {

}