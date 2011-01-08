classpath ".,../src,../lib,../../lib"

uses ronin.test.*

var result = org.junit.runner.JUnitCore.runClasses({ControllerDispatchTest, RoninTemplateTest, URLUtilTest})
print("Results: ${result.FailureCount}/${result.RunCount} failed")