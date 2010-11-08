classpath "."

uses org.eclipse.jetty.*
uses org.eclipse.jetty.servlet.*
uses org.eclipse.jetty.handler.*
uses ronin.RoninServlet
uses ronin.RoninArgs
uses gw.lang.cli.CommandLineAccess

CommandLineAccess.initialize(RoninArgs)
var server = new Server(RoninArgs.Port)
var root = new Context(server, "/", Context.SESSIONS)
root.ResourceBase = "."
var defaultHolder = new ServletHolder(new DefaultServlet())
root.addServlet(defaultHolder, "/public/*")
root.addServlet(new ServletHolder(new RoninServlet(RoninArgs.DevMode)), "/*")
server.start()
