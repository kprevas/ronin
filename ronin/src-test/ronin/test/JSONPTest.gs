package ronin.test

uses org.junit.Test
uses org.junit.Assert

class JSONPTest {

  @Test
  function testRedirect() {
    var resp = RoninTest.get("/JSONPTest/doJsonP?callback=myCallback")
    Assert.assertEquals("myCallback({\"foo\": \"bar\"})", resp.WriterBuffer.toString())
    Assert.assertEquals("application/javascript", resp.ContentType)
  }

}