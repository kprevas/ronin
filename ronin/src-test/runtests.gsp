classpath ".,../src,../lib"

uses ronin.test.*

org.junit.runner.JUnitCore.runClasses({ControllerDispatchTest, RoninTemplateTest, URLUtilTest})