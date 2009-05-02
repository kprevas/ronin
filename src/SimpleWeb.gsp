classpath ".;../lib"

uses org.mortbay.jetty.*
uses org.mortbay.jetty.servlet.*
uses org.mortbay.jetty.handler.*
uses gw.simpleweb.SimpleWebServlet
uses gw.simpleweb.SimpleWebArgs
uses gw.lang.cli.CommandLineAccess

CommandLineAccess.initialize(SimpleWebArgs)
var server = new Server(SimpleWebArgs.Port)
var root = new Context(server, "/", Context.SESSIONS)
var defaultHolder = new ServletHolder(new DefaultServlet())
root.addServlet(defaultHolder, "*.ico")
root.addServlet(defaultHolder, "*.gif")
root.addServlet(defaultHolder, "*.jpg")
root.addServlet(defaultHolder, "*.png")
root.addServlet(defaultHolder, "*.html")
root.addServlet(new ServletHolder(new SimpleWebServlet(SimpleWebArgs.DevMode)), "/*")
server.start()
