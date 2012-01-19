package controller

uses ronin.*

class Https extends ronin.RoninController {

  function httpOk() {
    view.OneStringArg.render(Writer, "success")
  }

  @HttpsOnly
  function httpsOnly() {
    view.OneStringArg.render(Writer, "success")
  }

}