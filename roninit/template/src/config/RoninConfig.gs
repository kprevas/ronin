package config

uses ronin.*
uses ronin.config.*

class RoninConfig extends DefaultRoninConfig {

  /* Set up your RoninConfig as you see fit */
  construct(m : ApplicationMode, an : RoninServlet) {
    super(m, an)
    //DefaultController = controller.MyDefaultController
    if(m == DEVELOPMENT) {
      AdminConsole.start()
    }
  }

}