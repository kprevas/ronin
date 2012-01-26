package controller

uses ronin.*

class StringRender extends ronin.RoninController {

  function getString(foo : String) : String {
    return "param was \"${foo}\""
  }

}