package controller

uses ronin.*

/**
 * This is the default out of the box controller.  You can modify it or set a different
 * default controller in config.RoninConfig
 */
class Main extends RoninController {

  function index() {
    view.Main.render(Writer)
  }

}