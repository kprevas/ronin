package controller

uses ronin.*

class MethodsRestricted extends ronin.RoninController {

  @Methods({GET})
  function getOnly() {
    view.OneStringArg.render(Writer, "success")
  }

  @Methods({POST})
  function postOnly() {
    view.OneStringArg.render(Writer, "success")
  }

  @Methods({PUT})
  function putOnly() {
    view.OneStringArg.render(Writer, "success")
  }

  @Methods({DELETE})
  function deleteOnly() {
    view.OneStringArg.render(Writer, "success")
  }

  @Methods({GET, POST})
  function getOrPost() {
    view.OneStringArg.render(Writer, "success")
  }

  @Methods({POST, PUT, DELETE})
  function noGet() {
    view.OneStringArg.render(Writer, "success")
  }

}