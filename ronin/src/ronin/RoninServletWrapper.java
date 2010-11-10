/**
 * Created by IntelliJ IDEA.
 * User: kprevas
 * Date: Nov 9, 2010
 * Time: 9:09:05 PM
 * To change this template use File | Settings | File Templates.
 */

package ronin;

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

  private boolean _init;
  private String _defaultAction;
  private String _defaultController;
  private String _servletClass;
  private HttpServlet _roninServlet;

  @Override
  protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    initGosu(req);
    _roninServlet.service(req, resp);
  }

  @Override
  public void init(ServletConfig config) throws ServletException {
    super.init(config);
    _defaultAction = config.getInitParameter("defaultAction");
    _defaultController = config.getInitParameter("defaultController");
    _servletClass = config.getInitParameter("servletClass");
  }

  private void initGosu(HttpServletRequest req) throws ServletException {
    if (!_init) {
      synchronized (RoninServletWrapper.class) {
        if (!_init) {
          String strServletDir = req.getSession().getServletContext().getRealPath("/");
          File servletDir = new File(strServletDir);
          final List<File> classpath = new ArrayList<File>();
          File webInf = new File(servletDir, "WEB-INF");
          if (webInf.isDirectory()) {
            File classes = new File(webInf, "classes");
            classpath.add(classes);
            File lib = new File(webInf, "lib");
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
                              classpath.add(0, new File(dir, name));
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
          _roninServlet = (HttpServlet) ReflectUtil.construct(_servletClass == null ? "ronin.RoninServlet" : _servletClass,
                  "true".equals(System.getProperty("dev.mode")));
          _roninServlet.init(getServletConfig());
          if (_defaultAction != null) {
            ReflectUtil.setProperty(_roninServlet, "DefaultAction", _defaultAction);
          }
          if (_defaultController != null) {
            ReflectUtil.setProperty(_roninServlet, "DefaultController", TypeSystem.getByFullName(_defaultController));
          }
          _init = true;
        }
      }
    }
  }

}