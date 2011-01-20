package ronin

uses gw.lang.IAnnotation

class JSONP implements IAnnotation {

  var _callback : String as Callback

  construct(callbackParameter : String) {
    _callback = callbackParameter
  }

}