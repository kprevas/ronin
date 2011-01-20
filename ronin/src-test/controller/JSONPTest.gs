package controller

uses ronin.*

class JSONPTest extends ronin.RoninController {

  @JSONP("callback")
  function doJsonP() {
    Writer.write("{\"foo\": \"bar\"}")
  }

}