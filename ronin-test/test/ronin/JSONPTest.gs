package ronin

uses java.lang.*
uses org.junit.*
uses ronin.*
uses ronin.test.*

class JSONPTest {

  @Test
  function testRedirect() {
    var resp = RoninTest.get("/JSONPTest/doJsonP?callback=myCallback")
    Assert.assertEquals("myCallback({\"foo\": \"bar\"})", resp.WriterBuffer.toString())
    Assert.assertEquals("application/javascript", resp.ContentType)
  }

}