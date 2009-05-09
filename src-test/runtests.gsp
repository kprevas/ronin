classpath ".,../src,../lib"

var test : gw.simpleweb.SimpleWebTest = new gw.simplewebtest.ControllerDispatchTest()
test.beforeTestClass()
for(method in gw.simplewebtest.ControllerDispatchTest.Type.TypeInfo.Methods) {
    if(method.Name.startsWith("test")) {
        method.CallHandler.handleCall( test, {} )
    }
}

test = new gw.simplewebtest.URLUtilTest()
for(method in gw.simplewebtest.URLUtilTest.Type.TypeInfo.Methods) {
    if(method.Name.startsWith("test")) {
        method.CallHandler.handleCall( test, {} )
    }
}
print("success")