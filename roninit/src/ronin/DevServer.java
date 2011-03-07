package ronin;

import gw.lang.parser.GosuParserFactory;
import gw.lang.parser.exceptions.ParseResultsException;
import gw.lang.parser.template.ITemplateGenerator;
import gw.lang.reflect.IType;
import gw.lang.reflect.TypeSystem;
import gw.lang.reflect.gs.IGosuClass;
import gw.lang.reflect.gs.ITemplateType;
import gw.lang.shell.Gosu;
import gw.util.Pair;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.filefilter.SuffixFileFilter;
import org.apache.commons.io.filefilter.TrueFileFilter;
import org.apache.commons.io.output.NullOutputStream;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.webapp.WebAppContext;
import org.h2.server.web.WebServer;
import org.junit.runner.Result;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.io.PrintStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class DevServer {
  private static String h2WebURL;

  public static void main(String[] args) throws Exception {

    if ("server".equals(args[0]) || "server-nodb".equals(args[0])) {
      if (System.getProperty("ronin.mode") == null) {
        System.setProperty("ronin.mode", "dev");
      }

      //===================================================================================
      //  Start Jetty
      //===================================================================================
      Server jettyServer = new Server(Integer.parseInt(args[1]));
      File webRoot = new File(args[2], "html");
      jettyServer.setHandler(new WebAppContext(webRoot.toURI().toURL().toExternalForm(), "/"));
      jettyServer.start();

      if ("server".equals(args[0])) {
        //===================================================================================
        //  Start H2
        //===================================================================================
        List<Pair<String, org.h2.tools.Server>> h2Servers = startH2(args[2], false);

        //===================================================================================
        //  Start H2 web
        //===================================================================================
        int webPort = 8082;
        for (Pair<String, org.h2.tools.Server> h2Server : h2Servers) {
          org.h2.tools.Server h2WebServer = org.h2.tools.Server.createWebServer(h2Server.getSecond().getURL(), "-webPort", Integer.toString(webPort));
          webPort++;
          h2WebServer.start();
          String h2URL = h2Server.getFirst();
          h2WebURL = ((WebServer) h2WebServer.getService()).addSession(DriverManager.getConnection(h2URL));
          log("H2 web console started at " + h2WebURL);
          log("\nYou can connect to your database using \"" + h2URL + "\" as your url, and a blank username/password.");
        }
        log("\nYour Ronin App is listening at http://localhost:8080\n");
      }
    } else if ("upgrade_db".equals(args[0])) {
      resetDb(args[1]);
    } else if ("verify_ronin_app".equals(args[0])) {
      File root = new File(args[1]);
      if (getMode() == null) {
        System.setProperty("ronin.mode", "dev");
      }
      log("Verifying app...");
      log("Environment properties are: " + new RoninServletWrapper().getEnvironmentProperties(root));
      if (!verifyApp(root)) {
        System.exit(-1);
      } else {
        log("No errors found.");
      }
    } else if ("test".equals(args[0])) {
      System.setProperty("ronin.mode", "test");
      resetDb(args[1]);
      File root = new File(args[1]);
      initGosu(root);
      TestScanner scanner = new TestScanner(new File(root, "test"));
      log("Running tests...");
      Result result = scanner.runTests();
      if (!result.wasSuccessful()) {
        System.exit(-1);
      }
    } else {
      throw new IllegalArgumentException("Do not understand command " + Arrays.toString(args));
    }
  }

  private static void resetDb(String arg) throws SQLException, IOException {
    List<Pair<String, org.h2.tools.Server>> h2Servers = startH2(arg, true);
    for (Pair<String, org.h2.tools.Server> h2Server : h2Servers) {
      h2Server.getSecond().stop();
    }
  }

  private static void initGosu(File root) {
    new RoninServletWrapper().initGosu(root, true);
  }

  public static String getH2WebURL() {
    return h2WebURL;
  }

  private static boolean verifyApp(File root) {
    boolean errorsFound = false;
    int typesVerified = 0;
    PrintStream oldErr = System.err;
    System.setErr(new PrintStream(new NullOutputStream()));
    StringBuilder output = new StringBuilder();
    try {
      initGosu(root);
      Set<? extends CharSequence> allTypeNames = TypeSystem.getAllTypeNames();
      for (CharSequence name : allTypeNames) {
        if (isNotExcluded(name)) {
          IType type = TypeSystem.getByFullNameIfValid(name.toString());
          if (type != null) {
            errorsFound = errorsFound || verifyType(output, type);
            typesVerified++;
          } else {
            output.append("Could not load ").append(name).append(" for verification, skipping\n");
          }
        }
      }
    } finally {
      System.setErr(oldErr);
    }
    log(output.toString());
    log(typesVerified + " types verified.");
    return !errorsFound;
  }

  private static boolean verifyType(StringBuilder output, IType type) {
    if (type instanceof IGosuClass) {
      boolean valid = type.isValid();
      if (!valid) {
        output.append("Errors in ").append(type.getName()).append(":\n");
        output.append(indentString(((IGosuClass) type).getParseResultsException().getFeedback())).append("\n");
        return true;
      }
    } else if (type instanceof ITemplateType) {
      if (!type.isValid()) {
        output.append("Errors in ").append(type.getName()).append(":\n");
        ITemplateGenerator generator = ((ITemplateType) type).getTemplateGenerator();
        try {
          generator.verify(GosuParserFactory.createParser(null));
        } catch (ParseResultsException e) {
          output.append(indentString(e.getFeedback())).append("\n");
        }
        return true;
      }
    } else {
      if (!type.isValid()) {
        output.append("Errors in ").append(type.getName()).append("\n");
      }
    }
    return false;
  }

  private static String indentString(String feedback) {
    StringBuilder indentedContent = new StringBuilder();
    String[] lines = feedback.split("\n");
    for (String line : lines) {
      indentedContent.append("  ").append(line);
      indentedContent.append("\n");
    }
    return indentedContent.toString();
  }

  private static boolean isNotExcluded(CharSequence name) {
    String nameAsString = name.toString();
    return
            !nameAsString.startsWith("gw.") &&
                    !nameAsString.startsWith("java.") &&
                    !nameAsString.startsWith("javax.") &&
                    !nameAsString.startsWith("com.apple.") &&
                    !nameAsString.startsWith("apple.") &&
                    !nameAsString.startsWith("ronin.") &&
                    !nameAsString.startsWith("tosa.") &&
                    !nameAsString.startsWith("sun.tools.") &&
                    !nameAsString.startsWith("com.sun.") &&
                    !nameAsString.startsWith("org.apache.commons.beanutils.") &&
                    !nameAsString.equals("Key") &&
                    !nameAsString.contains("$") &&
                    !nameAsString.endsWith(".PLACEHOLDER");
  }

  private static List<File> makeClasspathFromSystemClasspath() {
    ArrayList<File> files = new ArrayList<File>();
    for (String path : System.getProperty("java.class.path").split(File.pathSeparator)) {
      files.add(new File(path));
    }
    return files;
  }

  public static void initGosuWithSystemClasspath() {
    Gosu.init(null, makeClasspathFromSystemClasspath());
  }

  private static List<Pair<String, org.h2.tools.Server>> startH2(String root, boolean forceInit) throws SQLException, IOException {
    List<Pair<String, org.h2.tools.Server>> h2Servers = new ArrayList<Pair<String, org.h2.tools.Server>>();
    List<String> h2URLs = getH2URLs(root);
    Iterator<File> dbcFiles = getDbcFiles(root);
    int port = 9092;
    for (String h2URL : h2URLs) {
      File dbcFile = dbcFiles.next();
      org.h2.tools.Server h2Server = org.h2.tools.Server.createTcpServer(h2URL + ";TRACE_LEVEL_SYSTEM_OUT=3", "-tcpPort", Integer.toString(port));
      port++;
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
        String relativeLocation = dbcFile.getParentFile().getCanonicalPath()
                .substring(new File(root, "db/" + getMode()).getCanonicalPath().length() + 1);
        File srcLocation = new File(new File(root, "src"), relativeLocation);
        File file = new File(srcLocation, FilenameUtils.getBaseName(dbcFile.getName()) + ".ddl");
        if (file.exists()) {
          String sql = FileUtils.readFileToString(file);
          log("Creating DB from " + file.getAbsolutePath());
          stmt.execute(sql);
          log("Done");
        } else {
          log("Could not find an initial schema at " + file.getAbsolutePath() + ".  The database will be empty initially.");
        }
        stmt.execute("CREATE TABLE ronin_metadata (name varchar(256), value varchar(256))");
      }
      conn.close();
      h2Servers.add(Pair.make(h2URL, h2Server));
    }
    return h2Servers;
  }

  private static String getMode() {
    return System.getProperty("ronin.mode");
  }

  private static List<String> getH2URLs(String root) {
    Iterator<File> dbcFiles = getDbcFiles(root);

    List<String> h2Urls = new ArrayList<String>();
    for (; dbcFiles.hasNext();) {
      File dbcFile = dbcFiles.next();
      try {
        h2Urls.add(FileUtils.readFileToString(dbcFile).trim());
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    }
    return h2Urls;
  }

  private static Iterator<File> getDbcFiles(String root) {
    File dbRoot = new File(root, "db/" + getMode());
    return FileUtils.iterateFiles(dbRoot, new SuffixFileFilter(".dbc"), TrueFileFilter.INSTANCE);
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
    LoggerFactory.getLogger("Ronin").warn(s);
  }
}
