package ronin.test
uses ronin.RoninTest

class ControllerDispatchTest extends RoninTest {

    function testNoArgDispatch() {
        var resp = get("/SimplePassThru/noArgs")
        assertEquals("no arg view", resp.WriterBuffer.toString())
    }
    
    function testOneStringArgDispatch() {
        var resp = get("/SimplePassThru/oneStringArg?x=foo")
        assertEquals("foo", resp.WriterBuffer.toString())
    }
    
    function testOneBooleanArgDispatch() {
        var resp = get("/SimplePassThru/oneBooleanArg?x=true")
        assertEquals("true false", resp.WriterBuffer.toString())
    }

    function testOneIntegerArgDispatch() {
        var resp = get("/SimplePassThru/oneIntegerArg?x=27")
        assertEquals("27 28", resp.WriterBuffer.toString())
    }

    function testOneFloatArgDispatch() {
        var resp = get("/SimplePassThru/oneFloatArg?x=3.14")
        assertEquals("3.14 4.1400003", resp.WriterBuffer.toString())
    }
    
    function testOneDateArgDispatch() {
        var resp = get("/SimplePassThru/oneDateArg?x=12/19/1979")
        assertEquals("12/19/1979 true", resp.WriterBuffer.toString())
    }
    
    function testOneStringArrayArgDispatch() {
        var resp = get("/SimplePassThru/oneStringArrayArg?x[0]=zero&x[1]=one&x[2]=two")
        assertEquals("zero one two ", resp.WriterBuffer.toString())
    }
    
    function testOneDateArrayArgDispatch() {
        var resp = get("/SimplePassThru/oneDateArrayArg?x[0]=12/19/1979&x[1]=2/22/1982&x[2]=1/20/1984&x[3]=4/2/1993")
        assertEquals("true false false false ", resp.WriterBuffer.toString())
    }
    
    function testNullsFilledInForMissingArrayValues() {
        var resp = get("/SimplePassThru/oneStringArrayArg?x[0]=zero&x[2]=two")
        assertEquals("zero null two ", resp.WriterBuffer.toString())
    }
    
    function testMultipleArgDispatch() {
        var resp = get("/SimplePassThru/multipleArgs?a=foo&b=true&c=5&d=4.18&e=7/11/1980")
        assertEquals("foo true 5 4.18 7/11/1980", resp.WriterBuffer.toString())
    }

    function testStringPropertyDispatch() {
        var resp = get("/SimplePassThru/stringProperty?x.propA=foo")
        assertEquals("foo", resp.WriterBuffer.toString())
    }
    
    function testBooleanPropertyDispatch() {
        var resp = get("/SimplePassThru/booleanProperty?x.propB=true")
        assertEquals("true false", resp.WriterBuffer.toString())
    }

    function testIntegerPropertyDispatch() {
        var resp = get("/SimplePassThru/intProperty?x.propC=27")
        assertEquals("27 28", resp.WriterBuffer.toString())
    }

    function testFloatPropertyDispatch() {
        var resp = get("/SimplePassThru/floatProperty?x.propD=3.14")
        assertEquals("3.14 4.1400003", resp.WriterBuffer.toString())
    }
    
    function testDatePropertyDispatch() {
        var resp = get("/SimplePassThru/dateProperty?x.propE=12/19/1979")
        assertEquals("12/19/1979 true", resp.WriterBuffer.toString())
    }
    
    function testImplicitObjectFetchDispatch() {
        var resp = get("/SimplePassThru/stringProperty?x=foo")
        assertEquals("object foo", resp.WriterBuffer.toString())
    }
    
    function testStringPropertyDispatchFromObjectArray() {
        var resp = get("/SimplePassThru/stringPropertyFromArrayIndexZero?x[0].propA=foo")
        assertEquals("foo", resp.WriterBuffer.toString())
    }
    
    function testBooleanPropertyDispatchFromObjectArray() {
        var resp = get("/SimplePassThru/booleanPropertyFromArrayIndexZero?x[0].propB=true&x[1].propB=false")
        assertEquals("true false", resp.WriterBuffer.toString())
        resp = get("/SimplePassThru/booleanPropertyFromArrayIndexOne?x[0].propB=false&x[1].propB=true")
        assertEquals("true false", resp.WriterBuffer.toString())
    }

    function testIntegerPropertyDispatchFromObjectArray() {
        var resp = get("/SimplePassThru/intPropertyFromArrayIndexZero?x[0].propC=27&x[1].propC=48")
        assertEquals("27 28", resp.WriterBuffer.toString())
        resp = get("/SimplePassThru/intPropertyFromArrayIndexOne?x[0].propC=48&x[1].propC=27")
        assertEquals("27 28", resp.WriterBuffer.toString())
    }

    function testFloatPropertyDispatchFromObjectArray() {
        var resp = get("/SimplePassThru/floatPropertyFromArrayIndexZero?x[0].propD=3.14&x[1].propD=5.94")
        assertEquals("3.14 4.1400003", resp.WriterBuffer.toString())
        resp = get("/SimplePassThru/floatPropertyFromArrayIndexOne?x[0].propD=5.94&x[1].propD=3.14")
        assertEquals("3.14 4.1400003", resp.WriterBuffer.toString())
    }
    
    function testDatePropertyDispatchFromObjectArray() {
        var resp = get("/SimplePassThru/datePropertyFromArrayIndexZero?x[0].propE=12/19/1979&x[1].propE=7/11/1980")
        assertEquals("12/19/1979 true", resp.WriterBuffer.toString())
        resp = get("/SimplePassThru/datePropertyFromArrayIndexOne?x[0].propE=7/11/1980&x[1].propE=12/19/1979")
        assertEquals("12/19/1979 true", resp.WriterBuffer.toString())
    }
    
}