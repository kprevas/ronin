package controller

uses ronin.*

class LoginRequired extends ronin.RoninController {

  @NoAuth
  function loginNotRequired() {
    view.OneStringArg.render(Writer, "success")
  }

  function loginIsRequired() {
    view.OneStringArg.render(Writer, "success")
  }

  @NoAuth
  function login() {
    postLoginRedirect(#loginNotRequired())
  }

}