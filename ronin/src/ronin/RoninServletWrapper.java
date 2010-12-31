/**
 * Created by IntelliJ IDEA.
 * User: kprevas
 * Date: Nov 9, 2010
 * Time: 9:09:05 PM
 * To change this template use File | Settings | File Templates.
 */

package ronin;

import gw.lang.reflect.ITypeLoader;
import gw.lang.reflect.ReflectUtil;
import gw.lang.reflect.TypeSystem;
import gw.lang.shell.Gosu;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Class description...
 *
 * @author kprevas
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
    final List<File> classpath = new ArrayList<File>();
    File resourceRoot = determineRoot(servletDir);
    if (resourceRoot.isDirectory()) {
      File classes = new File(resourceRoot, "classes");
      classpath.add(classes);
      File src = new File(resourceRoot, "src");
      classpath.add(src);
      File lib = new File(resourceRoot, "lib");
      if (lib.isDirectory()) {
        //noinspection ResultOfMethodCallIgnored
        lib.listFiles(
          new FilenameFilter() {
            @Override
            public boolean accept(File dir, String name) {
              String lname = name.toLowerCase();
              if (lname.endsWith(".jar") || lname.endsWith(".zip")) {
                if (lname.endsWith("ronin.jar")) {
                  // workaround for http://code.google.com/p/gosu-lang/issues/detail?id=2
                  addRoninJar(dir, name, classpath);
                } else {
                  classpath.add(new File(dir, name));
                }
              }
              return false;
            }
          });
      }
    }
    Gosu.initGosu(null, classpath);

    //TODO cgross - remove me when we properly load typeloaders out of non java-classpath jars
    TypeSystem.pushGlobalTypeLoader((ITypeLoader) ReflectUtil.construct("ronindb.DBTypeLoader"));

    _roninServlet = (HttpServlet) ReflectUtil.construct("ronin.RoninServlet", "true".equals(System.getProperty("dev.mode")));
    _roninServlet.init(config);
    super.init(config);
  }

  private void addRoninJar(File dir, String name, List<File> classpath) {
    classpath.add(0, new File(dir, name));
    String[] s = System.getProperty("java.class.path").split(File.pathSeparator);
    for(String path : s) {
      File file = new File(path);
      if(file.isDirectory()) {
        if(file.getPath().endsWith(File.separator + "ronin" + File.separator + "src")) {
          classpath.add(0, file);
        }
      }
    }
  }

  private File determineRoot(File servletDir) {
    if (inDevMode()) {
      return servletDir.getParentFile();
    } else {
      return new File(servletDir, "WEB-INF");
    }
  }

  private boolean inDevMode() {
    return "true".equals(System.getProperty("ronin.devmode"));
  }

}