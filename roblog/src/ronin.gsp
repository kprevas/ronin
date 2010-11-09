classpath "../lib/ronin.jar,.,../lib"

uses org.mortbay.jetty.*
uses org.mortbay.jetty.servlet.*
uses org.mortbay.jetty.handler.*
uses ronin.RoninServlet
uses ronin.RoninArgs
uses gw.lang.cli.CommandLineAccess

CommandLineAccess.initialize(RoninArgs)
var server = new Server(RoninArgs.Port)
var root = new Context(server, "/", Context.SESSIONS)
root.ResourceBase = "."
var defaultHolder = new ServletHolder(new DefaultServlet())
root.addServlet(defaultHolder, "/public/*")
root.addServlet(new ServletHolder(new RoninServlet(RoninArgs.DevMode) {:defaultController = controller.Post}), "/*")
server.start()
