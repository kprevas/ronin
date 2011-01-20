package ronin.test

uses org.junit.Assert
uses org.junit.Test

uses ronin.*

class MethodRestrictionTest {

  @Test
  function testGetOnGetOnlySucceeds() {
    Assert.assertEquals("success", RoninTest.get("MethodsRestricted/getOnly").WriterBuffer.toString())
  }

  @Test(FiveHundredException, 0)
  function testPostOnGetOnlyFails() {
    RoninTest.post("MethodsRestricted/getOnly")
  }
  
  @Test(FiveHundredException, 0)
  function testPutOnGetOnlyFails() {
    RoninTest.put("MethodsRestricted/getOnly")
  }

  @Test(FiveHundredException, 0)
  function testDeleteOnGetOnlyFails() {
    RoninTest.delete("MethodsRestricted/getOnly")
  }

  @Test
  function testPostOnPostOnlySucceeds() {
    Assert.assertEquals("success", RoninTest.post("MethodsRestricted/postOnly").WriterBuffer.toString())
  }

  @Test(FiveHundredException, 0)
  function testGetOnPostOnlyFails() {
    RoninTest.get("MethodsRestricted/postOnly")
  }
  
  @Test(FiveHundredException, 0)
  function testPutOnPostOnlyFails() {
    RoninTest.put("MethodsRestricted/postOnly")
  }

  @Test(FiveHundredException, 0)
  function testDeleteOnPostOnlyFails() {
    RoninTest.delete("MethodsRestricted/postOnly")
  }

  @Test
  function testPutOnPutOnlySucceeds() {
    Assert.assertEquals("success", RoninTest.put("MethodsRestricted/putOnly").WriterBuffer.toString())
  }

  @Test(FiveHundredException, 0)
  function testPostOnPutOnlyFails() {
    RoninTest.post("MethodsRestricted/putOnly")
  }
  
  @Test(FiveHundredException, 0)
  function testGetOnPutOnlyFails() {
    RoninTest.get("MethodsRestricted/putOnly")
  }

  @Test(FiveHundredException, 0)
  function testDeleteOnPutOnlyFails() {
    RoninTest.delete("MethodsRestricted/putOnly")
  }

  @Test
  function testDeleteOnDeleteOnlySucceeds() {
    Assert.assertEquals("success", RoninTest.delete("MethodsRestricted/deleteOnly").WriterBuffer.toString())
  }

  @Test(FiveHundredException, 0)
  function testPostOnDeleteOnlyFails() {
    RoninTest.post("MethodsRestricted/deleteOnly")
  }
  
  @Test(FiveHundredException, 0)
  function testPutOnDeleteOnlyFails() {
    RoninTest.put("MethodsRestricted/deleteOnly")
  }

  @Test(FiveHundredException, 0)
  function testGetOnDeleteOnlyFails() {
    RoninTest.get("MethodsRestricted/deleteOnly")
  }

  @Test
  function testGetOnGetOrPostSucceeds() {
    Assert.assertEquals("success", RoninTest.get("MethodsRestricted/getOrPost").WriterBuffer.toString())
  }

  @Test
  function testPostOnGetOrPostSucceeds() {
    Assert.assertEquals("success", RoninTest.post("MethodsRestricted/getOrPost").WriterBuffer.toString())
  }
  
  @Test(FiveHundredException, 0)
  function testPutOnGetOrPostFails() {
    RoninTest.put("MethodsRestricted/getOrPost")
  }

  @Test(FiveHundredException, 0)
  function testDeleteOnGetOrPostFails() {
    RoninTest.delete("MethodsRestricted/getOrPost")
  }

  @Test(FiveHundredException, 0)
  function testGetOnNoGetFails() {
    RoninTest.get("MethodsRestricted/noGet")
  }

  @Test
  function testPostOnNoGetSucceeds() {
    Assert.assertEquals("success", RoninTest.post("MethodsRestricted/noGet").WriterBuffer.toString())
  }
  
  @Test
  function testPutOnNoGetSucceeds() {
    Assert.assertEquals("success", RoninTest.put("MethodsRestricted/noGet").WriterBuffer.toString())
  }

  @Test
  function testDeleteOnNoGetSucceeds() {
    Assert.assertEquals("success", RoninTest.delete("MethodsRestricted/noGet").WriterBuffer.toString())
  }

}