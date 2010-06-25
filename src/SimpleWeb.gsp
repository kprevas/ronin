classpath ".,../lib"

uses org.mortbay.jetty.*
uses org.mortbay.jetty.servlet.*
uses org.mortbay.jetty.handler.*
uses ronin.SimpleWebServlet
uses ronin.SimpleWebArgs
uses gw.lang.cli.CommandLineAccess

CommandLineAccess.initialize(SimpleWebArgs)
var server = new Server(SimpleWebArgs.Port)
var root = new Context(server, "/", Context.SESSIONS)
root.ResourceBase = "."
var defaultHolder = new ServletHolder(new DefaultServlet())
root.addServlet(defaultHolder, "/public/*")
root.addServlet(new ServletHolder(new SimpleWebServlet(SimpleWebArgs.DevMode)), "/*")
server.start()
