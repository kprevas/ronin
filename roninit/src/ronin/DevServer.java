package ronin;

import gw.util.StreamUtil;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.webapp.WebAppContext;

import java.io.File;
import java.io.FileReader;
import java.sql.*;
import java.util.Arrays;
import java.util.Properties;

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
      File h2Root = new File(args[2], "runtime/h2/devdb");

      String h2URL = "jdbc:h2:file:" + h2Root.getAbsolutePath();
      org.h2.tools.Server h2Server = org.h2.tools.Server.createTcpServer(h2URL, "TRACE_LEVEL_FILE=3");
      h2Server.start();

      log("H2 DB started at " + h2URL + " STATUS:" + h2Server.getStatus());

      Connection conn = DriverManager.getConnection(h2URL);
      if (!isInited(conn)) {
        File file = new File(args[2], "db/init.sql");
        String sql = StreamUtil.getContent(new FileReader(file));
        Statement stmt = conn.createStatement();
        if (file.exists()) {
          stmt.execute(sql);
        } else {
          log("Could not find an initial schema at " + file.getAbsolutePath() + ".  The database will be empty initially.");
        }
        stmt.execute("CREATE TABLE ronin_metadata ( name varchar(256), value varchar(256) )");
        conn.close();
      }

      //===================================================================================
      //  Start H2 web
      //===================================================================================
      org.h2.tools.Server h2WebServer = org.h2.tools.Server.createWebServer(h2URL);
      h2WebServer.start();
      log("H2 web console started at " + h2WebServer.getURL() + " STATUS:" + h2WebServer.getStatus());
      log("Use " + h2URL + " as your url, and a blank username/password to connect.");
    } else {
      throw new IllegalArgumentException("Do not understand command " + Arrays.toString(args));
    }
  }

  private static boolean isInited(Connection conn) throws SQLException {
    ResultSet tables = conn.getMetaData().getTables(null, null, null, null);
    while (tables.next()) {
      if (tables.getString("TABLE_NAME").equalsIgnoreCase("ronin_metadata")) {
        return true;
      }
    }
    return false;
  }

  private static void log(String s) {
    System.out.println(s);
  }
}
