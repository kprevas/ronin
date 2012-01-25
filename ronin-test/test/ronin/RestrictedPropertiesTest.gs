package ronin

uses java.lang.*
uses org.junit.*
uses ronin.*
uses ronin.test.*
uses ronin.config.*
uses controller.*

class RestrictedPropertiesTest {

  @BeforeClass
  static function initRestrictedProps() {
    (RoninTest.RawConfig as DefaultRoninConfig).RestrictedProperties = {
      (RestrictedPropertiesObj#Prop3).PropertyInfo
    }
  }

  @Test
  function testRestrictedPropertiesNotSet() {
    var resp = RoninTest.get("/RestrictedProperties/action?r.Prop1=foo&r.Prop2=foo&r.Prop3=foo&r.Prop4=foo")
    Assert.assertEquals("null null null foo", resp.WriterBuffer.toString())
  }

  @AfterClass
  static function restoreRestrictedProps() {
    (RoninTest.RawConfig as DefaultRoninConfig).RestrictedProperties = {}
  }

}