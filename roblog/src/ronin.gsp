classpath "../lib/ronin.jar,.,../lib"

uses org.eclipse.jetty.server.*
uses org.eclipse.jetty.servlet.*
uses ronin.RoninServlet
uses ronin.RoninArgs
uses gw.lang.cli.CommandLineAccess

CommandLineAccess.initialize(RoninArgs)
var server = new Server(RoninArgs.Port)
var root = new ServletContextHandler(ServletContextHandler.SESSIONS) {:ContextPath = "/"}
server.Handler = root
var defaultHolder = new ServletHolder(new DefaultServlet())
root.addServlet(defaultHolder, "/public/*")
root.addServlet(new ServletHolder(new RoninServlet(RoninArgs.DevMode) {:defaultController = controller.Post}), "/*")
server.start()
