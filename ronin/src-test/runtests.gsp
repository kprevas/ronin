classpath ".,../src,../lib,../../lib"

uses ronin.test.*

uses gw.lang.reflect.gs.IGosuClass

var result = org.junit.runner.JUnitCore.runClasses({
  ControllerDispatchTest, RoninTemplateTest, URLUtilTest, XSRFTest, FileUploadTest, UserAuthTest,
  URLHandlerTest, MethodRestrictionTest, RedirectTest, JSONPTest, RestrictedPropertiesTest, SimpleStringRenderTest
})
for(failure in result.Failures) {
  print("")
  print(failure.TestHeader)
  failure.Exception.printStackTrace()
}
print("Results: ${result.FailureCount}/${result.RunCount} failed")
