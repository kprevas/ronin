package controller

class Redirect extends ronin.RoninController {

  function doRedirect() {
    redirect(SimplePassThru#noArgs())
  }

}