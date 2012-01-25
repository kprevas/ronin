package ronin

uses java.lang.*
uses org.junit.*
uses ronin.*
uses ronin.test.*

class CacheTest {

  @Test
  function testBasicRequestCachingWorks() {
    var resp = RoninTest.get(controller.CacheTest#fromReqCache(1))
    Assert.assertEquals("11", resp.WriterBuffer.toString())

    resp = RoninTest.get(controller.CacheTest#fromReqCache(2))
    Assert.assertEquals("22", resp.WriterBuffer.toString())

    resp = RoninTest.get(controller.CacheTest#fromReqCache(3))
    Assert.assertEquals("33", resp.WriterBuffer.toString())
  }

  @Test
  function testBasicSessionCachingWorks() {
    var resp = RoninTest.get(controller.CacheTest#fromSessionCache(1))
    Assert.assertEquals("11", resp.WriterBuffer.toString())

    resp = RoninTest.get(controller.CacheTest#fromSessionCache(2))
    Assert.assertEquals("11", resp.WriterBuffer.toString())

    resp = RoninTest.get(controller.CacheTest#fromSessionCache(3))
    Assert.assertEquals("11", resp.WriterBuffer.toString())

    resp = RoninTest.get(controller.CacheTest#clearSessionCache())

    resp = RoninTest.get(controller.CacheTest#fromSessionCache(3))
    Assert.assertEquals("33", resp.WriterBuffer.toString())
  }

  @Test
  function testBasicApplicationCachingWorks() {
    var resp = RoninTest.get(controller.CacheTest#fromApplicationCache(1))
    Assert.assertEquals("11", resp.WriterBuffer.toString())

    resp = RoninTest.get(controller.CacheTest#fromApplicationCache(2))
    Assert.assertEquals("11", resp.WriterBuffer.toString())

    resp = RoninTest.get(controller.CacheTest#fromApplicationCache(3))
    Assert.assertEquals("11", resp.WriterBuffer.toString())

    resp = RoninTest.get(controller.CacheTest#clearApplicationCache())

    resp = RoninTest.get(controller.CacheTest#fromApplicationCache(3))
    Assert.assertEquals("33", resp.WriterBuffer.toString())
  }

  @AfterClass
  static function clearSession() {
    RoninTest.clearSession()
  }
}