//new ronindb.test.DBTLTestSuite().logErrors().run()

uses ronindb.test.*

var failures = 0
var instance = new DBTypeInfoTest()
for(method in DBTypeInfoTest.Type.TypeInfo.Methods) {
  if(method.Name.startsWith("test")) {
    instance.beforeTestMethod()
    try {
      method.CallHandler.handleCall(instance, {})
    } catch (e) {
      print("${method} failed:")
      e.printStackTrace()
      failures++
    }
  }
}
print("${failures} FAILURES")