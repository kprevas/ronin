package controller

uses ronin.*

class Main extends RoninController {

  static function index() {
    view.Main.render(writer)
  }

}