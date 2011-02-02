/**
 * Created by IntelliJ IDEA.
 * User: kprevas
 * Date: Nov 9, 2010
 * Time: 9:09:05 PM
 * To change this template use File | Settings | File Templates.
 */

package ronin;

import gw.internal.xml.ws.server.ServletWebservicesResponse;
import gw.internal.xml.ws.server.WebservicesResponse;
import gw.internal.xml.ws.server.WebservicesServletBase;
import gw.lang.reflect.ReflectUtil;
import gw.lang.shell.Gosu;
import gw.util.GosuStringUtil;

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
  private RoninWebServicesServlet _webservicesServlet;

  @Override
  protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    if (req.getPathInfo().startsWith("/webservice/list")) {
      String contextPath = req.getContextPath();
      if (GosuStringUtil.isEmpty(contextPath)) {
        contextPath = "/";
      }
      _webservicesServlet.doGetIndex(new ServletWebservicesResponse(resp), contextPath);
    } else if (req.getPathInfo().startsWith("/webservice/publish") || req.getPathInfo().startsWith("/resources.dftree/")) {
      _webservicesServlet.service(req, resp);
    } else {
      _roninServlet.service(req, resp);
    }
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
                classpath.add(new File(dir, name));
              }
              return false;
            }
          });
      }
    }
    Gosu.initGosu(null, classpath);

    _webservicesServlet = new RoninWebServicesServlet();
    _webservicesServlet.addWebService("webservice.publish.BlogInfo");
    _roninServlet = (HttpServlet) ReflectUtil.construct("ronin.RoninServlet", "true".equals(System.getProperty("dev.mode")));
    _roninServlet.init(config);
    super.init(config);
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

  static class RoninWebServicesServlet extends WebservicesServletBase {

    @Override
    public void addWebService(String typeName) {
      super.addWebService(typeName);    //To change body of overridden methods use File | Settings | File Templates.
    }

    @Override
    public void doGetIndex(WebservicesResponse response, String path) {
      super.doGetIndex(response, path);    //To change body of overridden methods use File | Settings | File Templates.
    }
  }
}