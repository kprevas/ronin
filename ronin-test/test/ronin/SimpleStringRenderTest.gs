package ronin

uses java.lang.*
uses org.junit.*
uses ronin.*
uses ronin.test.*

class SimpleStringRenderTest {

  @Test
  function testRedirect() {
    var resp = RoninTest.get("/StringRender/getString?foo=bar")
    Assert.assertEquals("param was \"bar\"", resp.WriterBuffer.toString())
  }

}