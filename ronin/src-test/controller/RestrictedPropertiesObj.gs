package controller

uses ronin.*

class RestrictedPropertiesObj {

  @Restricted
  var _prop1 : String as Prop1

  var _prop2 : String
  @Restricted
  property get Prop2() : String {
    return _prop2
  }
  @Restricted
  property set Prop2(s : String) {
    _prop2 = s
  }

  var _prop3 : String as Prop3

  var _prop4 : String as Prop4

}