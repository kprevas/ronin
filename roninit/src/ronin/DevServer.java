package ronin;

import org.mortbay.jetty.Server;
import org.mortbay.jetty.webapp.WebAppContext;

import java.io.File;
import java.util.Arrays;

public class DevServer {
  public static void main(String[] args) throws Exception {

    if ("server".equals(args[0])) {
      System.setProperty("ronin.devmode", "true");

      //===================================================================================
      //  Start Jetty
      //===================================================================================
      Server jettyServer = new Server(Integer.parseInt(args[1]));
      File webRoot = new File(args[2], "html");
      jettyServer.addHandler(new WebAppContext(webRoot.toURI().toURL().toExternalForm(), "/"));
      jettyServer.start();

      //===================================================================================
      //  Start H2
      //===================================================================================
      File h2Root = new File(args[2], "runtime/h2/roblog");
      h2Root.mkdirs();
      String h2URL = "jdbc:h2:file:" + h2Root.getAbsolutePath();
      org.h2.tools.Server h2Server = org.h2.tools.Server.createTcpServer( h2URL, "TRACE_LEVEL_FILE=3");
      h2Server.start();

      System.out.println("H2 DB started at " + h2URL + " STATUS:" + h2Server.getStatus());


      //===================================================================================
      //  Start H2 web
      //===================================================================================
      org.h2.tools.Server h2WebServer = org.h2.tools.Server.createWebServer(h2URL);
      h2WebServer.start();
      System.out.println("H2 web console started at " + h2WebServer.getURL() + " STATUS:" + h2WebServer.getStatus());
      System.out.println( "Use " + h2URL + " as your url, and a blank username/password to connect." );
    } else {
      throw new IllegalArgumentException("Do not understand command " + Arrays.toString(args));
    }
  }
}
