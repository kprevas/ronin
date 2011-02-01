/**
 * Created by IntelliJ IDEA.
 * User: kprevas
 * Date: Nov 9, 2010
 * Time: 9:09:05 PM
 * To change this template use File | Settings | File Templates.
 */

package ronin;

import gw.internal.xml.ws.GosuWebservicesServlet;
import gw.internal.xml.ws.server.WebservicesRequest;
import gw.internal.xml.ws.server.WebservicesResponse;
import gw.lang.reflect.ITypeLoader;
import gw.lang.reflect.ReflectUtil;
import gw.lang.reflect.TypeSystem;
import gw.lang.shell.Gosu;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Java wrapper for a {@link ronin.RoninServlet}, for use in web.xml-based servlet containers.
 * Responsible for initializing Gosu, constructing the servlet, and delegating to it.
 */
public class RoninServletWrapper extends HttpServlet {

  private HttpServlet _roninServlet;
  private GosuWebservicesServlet _webservicesServlet;

  @Override
  protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    if (req.getContextPath().startsWith("/webservice/publish")) {
      dispatchWebServiceRequest(req, resp);
    } else {
      _roninServlet.service(req, resp);
    }
  }

  private void dispatchWebServiceRequest(HttpServletRequest req, HttpServletResponse resp) throws ServletException {
    if (req.getMethod().equalsIgnoreCase("GET")) {
      _webservicesServlet.doGet(new RoninWebservicesRequest(req), new RoninWebservicesResponse(resp));
    } else {
      _webservicesServlet.doPost(new RoninWebservicesRequest(req), new RoninWebservicesResponse(resp));
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

    _webservicesServlet = new GosuWebservicesServlet();
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

  private static class RoninWebservicesRequest extends WebservicesRequest {
    public RoninWebservicesRequest(HttpServletRequest req) {
      //To change body of created methods use File | Settings | File Templates.
    }

    @Override
    public String getPathInfo() {
      return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public String getQueryString() {
      return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public StringBuffer getRequestURL() {
      return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public InputStream getInputStream() throws IOException {
      return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public Map<String, List<String>> getHeaders() {
      return null;  //To change body of implemented methods use File | Settings | File Templates.
    }
  }

  private static class RoninWebservicesResponse extends WebservicesResponse {
    public RoninWebservicesResponse(HttpServletResponse resp) {
      //To change body of created methods use File | Settings | File Templates.
    }

    @Override
    public void sendError(int i) throws IOException {
      //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public void setStatus(int i) {
      //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public void setContentType(String s) {
      //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public OutputStream getOutputStream() throws IOException {
      return null;  //To change body of implemented methods use File | Settings | File Templates.
    }
  }
}