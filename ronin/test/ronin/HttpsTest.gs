package ronin

uses java.lang.*
uses org.junit.*
uses ronin.*
uses ronin.test.*

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

  @Test(FiveHundredException, 0)
  function testHttpToHttpsOnlyMethodFails() {
    RoninTest.get("Https/httpsOnly")
  }

  @Test
  function testHttpsToHttpsOnlyClassOk() {
    using(RoninTest.https()) {
      RoninTest.get("HttpsClass/noAnnotation")
    }
  }

  @Test(FiveHundredException, 0)
  function testHttpToHttpsOnlyClassFails() {
    RoninTest.get("HttpsClass/noAnnotation")
  }

}