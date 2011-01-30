package ronin.test

uses java.lang.*
uses java.util.*

uses org.junit.Assert
uses org.junit.Test
uses org.junit.Before
uses org.junit.After

uses ronin.*
uses ronin.config.*

uses controller.*

class RestrictedPropertiesTest {

  @Before
  function initRestrictedProps() {
    (RoninTest.RawConfig as DefaultRoninConfig).RestrictedProperties = {
      (RestrictedPropertiesObj#Prop3).PropertyInfo
    }
  }

  @Test
  function testRestrictedPropertiesNotSet() {
    var resp = RoninTest.get("/RestrictedProperties/action?r.Prop1=foo&r.Prop2=foo&r.Prop3=foo&r.Prop4=foo")
    Assert.assertEquals("null null null foo", resp.WriterBuffer.toString())
  }

  @After
  function restoreRestrictedProps() {
    (RoninTest.RawConfig as DefaultRoninConfig).RestrictedProperties = {}
  }

}