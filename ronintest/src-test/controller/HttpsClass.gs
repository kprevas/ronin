package controller

uses ronin.*

@HttpsOnly
class HttpsClass extends ronin.RoninController {

  function noAnnotation() {
    view.OneStringArg.render(Writer, "success")
  }

}