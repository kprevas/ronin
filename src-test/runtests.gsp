classpath ".,../src,../lib"

var test = new gw.simplewebtest.ControllerDispatchTest()
test.beforeTestClass()
for(method in gw.simplewebtest.ControllerDispatchTest.Type.TypeInfo.Methods) {
    if(method.Name.startsWith("test")) {
        method.CallHandler.handleCall( test, {} )
    }
}
print("success")