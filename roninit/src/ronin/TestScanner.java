package ronin;

import gw.lang.reflect.IType;
import gw.lang.reflect.TypeSystem;
import gw.lang.reflect.gs.IGosuClass;
import org.junit.Test;
import org.junit.internal.TextListener;
import org.junit.runner.JUnitCore;
import org.junit.runner.Result;

import java.io.File;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

public class TestScanner {

  private File[] _dirsToScan;

  public static void main(String[] args) {
    File[] files = new File[args.length];
    for (int i = 0, argsLength = args.length; i < argsLength; i++) {
      files[i] = new File(args[i]);
    }
    Result result = new TestScanner(files).runTests();
    if (!result.wasSuccessful()) {
      System.exit(-1);
    }
  }

  public TestScanner(File... dirsToScan) {
    _dirsToScan = dirsToScan;
  }

  public Result runTests() {
    DevServer.initGosuWithSystemClasspath();
    ArrayList<Class> tests = new ArrayList<Class>();
    for (File root : _dirsToScan) {
      addTests(tests, root, root);
    }
    JUnitCore core = new JUnitCore();
    core.addListener(new TextListener(System.out));
    Result result = core.run(tests.toArray(new Class[0]));
    return result;
  }

  private static void addTests(List<Class> tests, File testDir, File possibleTest) {
    if (!possibleTest.exists()) {
      return;
    } else if (possibleTest.isDirectory()) {
      for (File child : possibleTest.listFiles()) {
        addTests(tests, testDir, child);
      }
    } else {
      String relativeName = possibleTest.getAbsolutePath().substring(testDir.getAbsolutePath().length() + 1);
      int lastDot = relativeName.lastIndexOf(".");
      if (lastDot > 0) {
        relativeName = relativeName.substring(0, lastDot);
        String typeName = relativeName.replace(File.separator, ".");
        IType type = TypeSystem.getByFullNameIfValid(typeName);
        if (type instanceof IGosuClass && !type.isAbstract()) {
          Class backingClass = ((IGosuClass) type).getBackingClass();
          if (junit.framework.Test.class.isAssignableFrom(backingClass)) {
            tests.add(backingClass);
          } else if (isJUnit4Test(backingClass)) {
            tests.add(backingClass);
          }
        }
      }
    }
  }

  private static boolean isJUnit4Test(Class clazz) {
    for (Method m : clazz.getMethods()) {
      if (m.getAnnotation(Test.class) != null) {
        return true;
      }
    }
    return false;
  }
}