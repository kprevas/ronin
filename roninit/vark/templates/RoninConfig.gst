package config

uses ronin.*

class RoninConfig implements IRoninConfig {

  /* Configure the RoninServlet as you see fit here */
  override function init( servlet : RoninServlet ) {
    servlet.DefaultController = controller.Main
    servlet.DefaultAction = "index"
  }

}