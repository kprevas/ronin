package ronin.test

uses org.junit.Assert
uses org.junit.Test

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

}