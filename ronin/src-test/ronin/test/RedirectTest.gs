package ronin.test

uses org.junit.Test

class RedirectTest {

  @Test
  function testRedirect() {
    var resp = RoninTest.get("/Redirect/doRedirect")
    // TODO call statically when Gosu bug is fixed
    new RoninTest().assertRedirect(resp)
    RoninTest.assertRedirect(resp, "/SimplePassThru/noArgs")
  }

}