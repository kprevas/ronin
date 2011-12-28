package scratch;

import gw.lang.reflect.IHasJavaClass;
import gw.lang.reflect.TypeSystem;
import gw.lang.shell.Gosu;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.model.InitializationError;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@RunWith(RoninScratchSuite.class)
public class RoninScratchSuite extends Suite {

  public RoninScratchSuite(Class clazz) throws InitializationError {
    super(init(clazz), getAllTestClasses());
  }

  private static Class init(Class clazz) {
    Gosu.init(files("ronin/src", "roninlog/src", "ronintest/src", "ronintest/src-test", "lib"));
    return clazz;
  }

  private static List<File> files(String... files) {
    ArrayList<File> retFiles = new ArrayList<File>();
    for (String file : files) {
      File f = new File(file);
      if (!f.exists()) {
        throw new IllegalArgumentException("No file found at " + f.getAbsolutePath());
      }
      retFiles.add(f);
      for (File child : f.listFiles()) {
        if (child.getName().endsWith(".jar")) {
          retFiles.add(child);
        }
      }
    }
    return retFiles;
  }

  public static Class[] getAllTestClasses() {
    return classesFor(
      "ronin.http.URLEnhancementTest"
    );
  }

  private static Class[] classesFor(String... types) {
    ArrayList<Class> classes = new ArrayList<Class>();
    for (String typeName : types) {
      IHasJavaClass type = (IHasJavaClass) TypeSystem.getByFullName(typeName);
      classes.add(type.getBackingClass());
    }
    return classes.toArray(new Class[classes.size()]);
  }
}
