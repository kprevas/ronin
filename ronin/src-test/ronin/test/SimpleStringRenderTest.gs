package ronin.test

uses org.junit.Test
uses org.junit.Assert

class SimpleStringRenderTest {

  @Test
  function testRedirect() {
    var resp = RoninTest.get("/StringRender/getString?foo=bar")
    Assert.assertEquals("param was \"bar\"", resp.WriterBuffer.toString())
  }

}