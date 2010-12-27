package ronin;

import gw.internal.gosu.parser.GosuParser;
import gw.lang.parser.GosuParserFactory;
import gw.lang.parser.IParseIssue;
import gw.lang.parser.exceptions.ParseResultsException;
import gw.lang.parser.template.ITemplateGenerator;
import gw.lang.reflect.IType;
import gw.lang.reflect.TypeSystem;
import gw.lang.reflect.gs.IGosuClass;
import gw.lang.reflect.gs.ITemplateType;
import gw.lang.shell.Gosu;
import gw.util.GosuArrayUtil;
import gw.util.StreamUtil;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.webapp.WebAppContext;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

public class DevServer {
  public static void main(String[] args) throws Exception {

    if ("server".equals(args[0])) {
      System.setProperty("ronin.devmode", "true");
      System.setProperty("dev.mode", "true");

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
      org.h2.tools.Server h2Server = startH2(args[2], false);

      //===================================================================================
      //  Start H2 web
      //===================================================================================
      org.h2.tools.Server h2WebServer = org.h2.tools.Server.createWebServer(h2Server.getURL());
      h2WebServer.start();
      log("H2 web console started at " + h2WebServer.getURL() + " STATUS:" + h2WebServer.getStatus());
      log("Use " + h2WebServer.getURL() + " as your url, and a blank username/password to connect.");

      log("\n\nYour Ronin App is listening at http://localhost:8080\n\n");
    } else if ("upgrade_db".equals(args[0])) {
      org.h2.tools.Server h2URL = startH2(args[1], true);
      h2URL.stop();
    } else if ("verify_ronin_app".equals(args[0])) {
      if (!verifyApp()) {
        System.exit(-1);
      } else {
        log("\n\nYour ronin app looks pretty good.");
      }
    } else {
      throw new IllegalArgumentException("Do not understand command " + Arrays.toString(args));
    }
  }

  private static boolean verifyApp() {
    Gosu.initGosu(null, makeClasspathFromSystemClasspath());
    Set<? extends CharSequence> allTypeNames = TypeSystem.getAllTypeNames();
    boolean errorsFound = false;
    for (CharSequence name : allTypeNames) {
      if (isNotExcludedPackage(name)) {
        IType type = TypeSystem.getByFullNameIfValid(name.toString());
        if (type != null) {
          if (type instanceof IGosuClass) {
            boolean valid = type.isValid();
            if (!valid) {
              log("Errors in " + type.getName() + ":\n");
              log(indentString(((IGosuClass) type).getParseResultsException().getFeedback()));
              errorsFound = true;
            }
          } else if (type instanceof ITemplateType) {
            if (!type.isValid()) {
              log("Errors in " + type.getName() + ":\n");
              ITemplateGenerator generator = ((ITemplateType) type).getTemplateGenerator();
              try {
                generator.verify(GosuParserFactory.createParser(null));
              } catch (ParseResultsException e) {
                log(indentString(e.getFeedback()));                
              }
              errorsFound = true;
            }
          }
        } else {
          //log("Could not load " + name + " for verification, skipping");
        }
      }
    }
    return !errorsFound;
  }

  private static String indentString(String feedback) {
    StringBuilder indentedContent = new StringBuilder();
    String[] lines = feedback.split("\n");
    for (int i = 0; i < lines.length; i++) {
      indentedContent.append("  ").append(lines[i]);
      indentedContent.append("\n");
    }
    return indentedContent.toString();
  }

  private static boolean isNotExcludedPackage(CharSequence name) {
    String nameAsString = name.toString();
    return
      !nameAsString.startsWith("gw.") &&
      !nameAsString.startsWith("java.") &&
      !nameAsString.startsWith("javax.") &&
      !nameAsString.startsWith("com.apple.") &&
      !nameAsString.startsWith("apple.") &&
      !nameAsString.startsWith("ronin.") &&
      !nameAsString.startsWith("ronindb.") &&
      !nameAsString.startsWith("sun.tools.") &&
      !nameAsString.startsWith("com.sun.");
  }

  private static List<File> makeClasspathFromSystemClasspath() {
    ArrayList<File> files = new ArrayList<File>();
    for (String path : System.getProperty("java.class.path").split(File.pathSeparator)) {
      files.add(new File(path));
    }
    return files;
  }

  private static org.h2.tools.Server startH2(String root, boolean forceInit) throws SQLException, IOException {
    File h2Root = new File(root, "runtime/h2/devdb");

    String h2URL = "jdbc:h2:file:" + h2Root.getAbsolutePath();
    org.h2.tools.Server h2Server = org.h2.tools.Server.createTcpServer(h2URL + ";TRACE_LEVEL_SYSTEM_OUT=3");
    h2Server.start();

    log("H2 DB started at " + h2URL + " STATUS:" + h2Server.getStatus());

    Connection conn = DriverManager.getConnection(h2URL);
    Statement stmt = conn.createStatement();
    if (forceInit) {
      log("Dropping all user tables");
      stmt.execute("DROP ALL OBJECTS");
      log("Dropped all user tables");
    }
    if (forceInit || !isInited(conn)) {
      File file = new File(root, "db/init.sql");
      String sql = StreamUtil.getContent(new FileReader(file));
      if (file.exists()) {
        log("Creating DB from " + file.getAbsolutePath());
        stmt.execute(sql);
        log("Done");
      } else {
        log("Could not find an initial schema at " + file.getAbsolutePath() + ".  The database will be empty initially.");
      }
      stmt.execute("CREATE TABLE ronin_metadata ( name varchar(256), value varchar(256) )");
    }
    conn.close();
    return h2Server;
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
