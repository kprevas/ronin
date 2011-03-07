/**
 * Created by IntelliJ IDEA.
 * User: kprevas
 * Date: Nov 9, 2010
 * Time: 9:09:05 PM
 * To change this template use File | Settings | File Templates.
 */

package ronin;

import gw.lang.reflect.ReflectUtil;
import gw.lang.shell.Gosu;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Java wrapper for a {@link ronin.RoninServlet}, for use in web.xml-based servlet containers.
 * Responsible for initializing Gosu, constructing the servlet, and delegating to it.
 */
public class RoninServletWrapper extends HttpServlet {

  private HttpServlet _roninServlet;

  @Override
  protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    _roninServlet.service(req, resp);
  }

  @Override
  public void init(ServletConfig config) throws ServletException {
    String strServletDir = config.getServletContext().getRealPath("/");
    File servletDir = new File(strServletDir);
    initGosu(servletDir, false);

    _roninServlet = (HttpServlet) ReflectUtil.construct("ronin.RoninServlet", getMode());
    _roninServlet.init(config);
    super.init(config);
  }

  void initGosu(File servletDir, boolean includeTests) {
    final List<File> classpath = new ArrayList<File>();
    File resourceRoot = determineRoot(servletDir);
    if (resourceRoot.isDirectory()) {
      File classes = new File(resourceRoot, "classes");
      classpath.add(classes);
      File src = new File(resourceRoot, "src");
      classpath.add(src);
      if (includeTests) {
        File test = new File(resourceRoot, "test");
        classpath.add(test);
      }
      File lib = new File(resourceRoot, "lib");
      if (lib.isDirectory()) {
        //noinspection ResultOfMethodCallIgnored
        lib.listFiles(
          new FilenameFilter() {
            @Override
            public boolean accept(File dir, String name) {
              String lname = name.toLowerCase();
              if (lname.endsWith(".jar") || lname.endsWith(".zip")) {
                classpath.add(new File(dir, name));
              }
              return false;
            }
          });
      }
      File db = new File(resourceRoot, "db");
      if (db.exists()) {
        File dbMode = new File(db, getMode());
        if (dbMode.exists()) {
          db = dbMode;
        }
        classpath.add(db);
      }
    }
    Gosu.init(null, classpath);
  }

  private File determineRoot(File servletDir) {
    File webinf = new File(servletDir, "WEB-INF");
    if (new File(webinf, "classes").exists() || new File(webinf, "lib").exists()) {
      return webinf;
    } else {
      return servletDir.getParentFile();
    }
  }

  private String getMode() {
    String mode = System.getProperty("ronin.mode");
    return mode == null ? "prod" : mode;
  }

}