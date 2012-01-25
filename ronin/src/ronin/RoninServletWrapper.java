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
import org.slf4j.LoggerFactory;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Java wrapper for a {@link ronin.RoninServlet}, for use in web.xml-based servlet containers.
 * Responsible for initializing Gosu, constructing the servlet, and delegating to it.
 */
public class RoninServletWrapper extends HttpServlet {

  private AbstractRoninServlet _roninServlet;
  public static final String RONIN_SERVLET_SLOT = "ronin.RoninServletWrapper.SLOT$$";

  @Override
  protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    _roninServlet.service(req, resp);
  }

  @Override
  public void init(ServletConfig config) throws ServletException {
    String strServletDir = config.getServletContext().getRealPath("/");
    File servletDir = new File(strServletDir);
    initGosu(servletDir, "test".equals(getMode()));
    _roninServlet = (AbstractRoninServlet) ReflectUtil.construct("ronin.RoninServlet", getMode(), getSourceDir(servletDir));
    _roninServlet.init(config);
    super.init(config);
    config.getServletContext().setAttribute(RONIN_SERVLET_SLOT, _roninServlet);
  }

  void initGosu(File servletDir, boolean includeTests) {
    final List<File> classpath = new ArrayList<File>();
    if (System.getProperties().getProperty("ronin.devsource") != null) {
      classpath.add(new File(System.getProperties().getProperty("ronin.devsource")));
    }
    File resourceRoot = determineRoot(servletDir);
    if (resourceRoot.isDirectory()) {
      File classes = new File(resourceRoot, "classes");
      classpath.add(classes);
      File src = new File(resourceRoot, "src");
      classpath.add(src);
      if (includeTests) {
        File test = new File(resourceRoot, "test");
        classpath.add(test);
        File support = new File(resourceRoot, "support");
        if (support.exists()) {
          addLibraries(classpath, support);
        }
      }
      addLibToClasspath(classpath, resourceRoot);
      addEnvToClasspath(classpath, resourceRoot);
    }
    Gosu.init(null, classpath);
  }

  private void addLibToClasspath(final List<File> classpath, File resourceRoot) {
    File lib = new File(resourceRoot, "lib");
    if (lib.isDirectory()) {
      addLibraries(classpath, lib);
    }
  }

  private void addLibraries(final List<File> classpath, File lib) {
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

  private void addEnvToClasspath(final List<File> classpath, File resourceRoot) {
    Map<String, String> environmentProperties = getEnvironmentProperties(resourceRoot);
    for (Map.Entry<String, String> property : environmentProperties.entrySet()) {
      File activeEnvDir = new File(resourceRoot, "env" + File.separator + property.getKey() + File.separator + property.getValue());
      if (activeEnvDir.exists()) {
        classpath.add(activeEnvDir);
      } else {
        LoggerFactory.getLogger("Ronin").warn("No directory found for value " + property.getValue() + " in env directory " + property.getKey());
      }
    }
  }

  Map<String, String> getEnvironmentProperties(File resourceRoot) {
    final Map<String,String> envProps = new HashMap<String, String>();
    final File env = new File(resourceRoot, "env");
    if (env.exists()) {
      //noinspection ResultOfMethodCallIgnored
      env.listFiles(
              new FilenameFilter() {
                @Override
                public boolean accept(File dir, String name) {
                  File envDir = new File(dir, name);
                  if (envDir.isDirectory()) {
                    String propertyValue = System.getProperty("ronin." + name);
                    if (propertyValue == null) {
                      propertyValue = "default";
                    }
                    envProps.put(name, propertyValue);
                  }
                  return false;
                }
              }
      );
    }
    return envProps;
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

  public File getSourceDir(File servletDir) {
    File resourceRoot = determineRoot(servletDir);
    if (resourceRoot.isDirectory()) {
      return new File(resourceRoot, "src");
    } else {
      return null;
    }
  }
}
