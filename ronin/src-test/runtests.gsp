classpath ".,../src,../lib,../../lib"

uses ronin.test.*

var result = org.junit.runner.JUnitCore.runClasses({
  ControllerDispatchTest, RoninTemplateTest, URLUtilTest, XSRFTest, FileUploadTest, UserAuthTest, MethodRestrictionTest
})
for(failure in result.Failures) {
  print("")
  print(failure.TestHeader)
  failure.Exception.printStackTrace()
}
print("Results: ${result.FailureCount}/${result.RunCount} failed")
