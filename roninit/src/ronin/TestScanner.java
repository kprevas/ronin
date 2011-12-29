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
    DevServer.initGosuWithSystemClasspath();
    Result result = new TestScanner(files).runTests(false, true);
    System.exit(result.wasSuccessful() ? 0 : -1);
  }

  public TestScanner(File... dirsToScan) {
    _dirsToScan = dirsToScan;
  }

  public Result runUITests(boolean parallelClasses, boolean parallelMethods) {
    return runTests(parallelClasses, parallelMethods, true);
  }

  public Result runTests(boolean parallelClasses, boolean parallelMethods) {
    return runTests(parallelClasses, parallelMethods, false);
  }

  private Result runTests(boolean parallelClasses, boolean parallelMethods, boolean uiTests) {
    ArrayList<Class> tests = new ArrayList<Class>();
    for (File root : _dirsToScan) {
      addTests(tests, root, root, uiTests);
    }
    JUnitCore core = new JUnitCore();
    core.addListener(new TextListener(System.out));
    //TODO cgross - restore new ParallelComputer(parallelClasses, parallelMethods),
    Result result = core.run(tests.toArray(new Class[tests.size()]));
    return result;
  }

  private static void addTests(List<Class> tests, File testDir, File possibleTest, boolean uiTests) {
    if (possibleTest.exists()) {
      if (possibleTest.isDirectory()) {
        for (File child : possibleTest.listFiles()) {
          addTests(tests, testDir, child, uiTests);
        }
      } else {
        String relativeName = possibleTest.getAbsolutePath().substring(testDir.getAbsolutePath().length() + 1);
        int lastDot = relativeName.lastIndexOf(".");
        if (lastDot > 0) {
          relativeName = relativeName.substring(0, lastDot);
          String typeName = relativeName.replace(File.separator, ".");
          IType type = TypeSystem.getByFullNameIfValid(typeName);
          if (type instanceof IGosuClass && !type.isAbstract()) {
            IGosuClass gosuClass = (IGosuClass) type;
            if((gosuClass.getTypeInfo().getAnnotation(TypeSystem.getByFullName("ronin.test.UITest")) != null) == uiTests) {
              Class backingClass = gosuClass.getBackingClass();
              if (junit.framework.Test.class.isAssignableFrom(backingClass)) {
                tests.add(backingClass);
              } else if (isJUnit4Test(backingClass)) {
                tests.add(backingClass);
              }
            }
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