package config

uses ronin.*
uses ronin.config.*

/**
 * This class gives you a way to programatically configure the ronin servlet
 */
class RoninConfig implements IRoninConfig {

  override function init( servlet : RoninServlet ) {
    servlet.DefaultController = controller.Main
    servlet.DefaultAction = "index"
  }

}