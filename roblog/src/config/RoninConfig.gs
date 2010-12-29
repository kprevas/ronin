package config

uses ronin.*
uses ronin.config.*

class RoninConfig implements IRoninConfig {

  /* Configure the RoninServlet as you see fit here */
  override function init( servlet : RoninServlet ) {
    servlet.DefaultController = controller.PostCx
    servlet.DefaultAction = "index"
  }

}