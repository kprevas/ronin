package ronin

uses java.lang.*
uses org.junit.*
uses ronin.*
uses ronin.test.*
uses controller.Https
uses controller.HttpsClass
uses ronin.config.DefaultRoninConfig

class HttpsTest {

  @Test
  function testHttpsToNormalMethodOk() {
    using(RoninTest.https()) {
      RoninTest.get("Https/httpOk")
    }
  }

  @Test
  function testHttpsToHttpsOnlyMethodOk() {
    using(RoninTest.https()) {
      RoninTest.get("Https/httpsOnly")
    }
  }

  @Test
  function testHttpToHttpsOnlyMethodRedirects() {
    var resp = RoninTest.get("Https/httpsOnly")
    RoninTest.assertRedirect(resp)
    RoninTest.assertRedirectTo(resp, Https#httpsOnly())
  }


  @Test(FiveHundredException, 0)
  function testHttpToHttpsOnlyMethodFails() {
    try {
      (RoninTest.RawConfig as DefaultRoninConfig).HttpsStrategy = FAIL
      RoninTest.get("Https/httpsOnly")
    } finally {
      (RoninTest.RawConfig as DefaultRoninConfig).HttpsStrategy = REDIRECT
    }
  }

  @Test
  function testHttpsToHttpsOnlyClassOk() {
    using(RoninTest.https()) {
      RoninTest.get("HttpsClass/noAnnotation")
    }
  }

  @Test
  function testHttpToHttpsOnlyClassRedirects() {
    var resp = RoninTest.get("HttpsClass/noAnnotation")
    RoninTest.assertRedirect(resp)
    RoninTest.assertRedirectTo(resp, HttpsClass#noAnnotation())
  }

  @Test(FiveHundredException, 0)
  function testHttpToHttpsOnlyClassFails() {
    try {
      (RoninTest.RawConfig as DefaultRoninConfig).HttpsStrategy = FAIL
      RoninTest.get("HttpsClass/noAnnotation")
    } finally {
      (RoninTest.RawConfig as DefaultRoninConfig).HttpsStrategy = REDIRECT
    }
  }

}