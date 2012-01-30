package controller

uses java.util.Date

class ParamObj {

  var _a : String as propA
  var _b : boolean as propB
  var _c : int as propC
  var _d : float as propD
  var _e : Date as propE
  var _f : String[] as propF
  var _g : ParamObj as propG

  static function fromId(key : String) : ParamObj {
      return new ParamObj(){:propA = "object ${key}"}
  }

  function toID() : String {
      return propA
  }

}