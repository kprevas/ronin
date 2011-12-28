package http

uses java.lang.*
uses java.net.*
uses org.junit.*
uses ronin.*

class URLEnhancementTest {

  @Test
  function testBasicGetWorks() {
    Assert.assertNotNull( new URL("http://www.google.com" ).get() )
  }

  @Test
  function testRawGetWorks() {
    Assert.assertNotNull( new URL("http://www.google.com" ).getRaw() )
  }

  @Test
  function testGetWithParamWorks() {
    Assert.assertNotNull( new URL("http://www.google.com" ).get({"q" -> "gosu rocks"}) )
  }

  @Test
  function testBasicPostWorks() {
    Assert.assertNotNull( new URL("http://www.google.com" ).post() )
  }

  @Test
  function testRawPostWorks() {
    Assert.assertNotNull( new URL("http://www.google.com" ).postRaw() )
  }

  @Test
  function testPostWithParamWorks() {
    Assert.assertNotNull( new URL("http://www.google.com" ).post({"q" -> "gosu rocks"}) )
  }

}