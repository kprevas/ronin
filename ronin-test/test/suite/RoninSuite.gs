package suite

uses org.junit.runner.RunWith
uses org.junit.runners.Suite
uses org.junit.runners.Suite.SuiteClasses

@RunWith(Suite)
@SuiteClasses({
  http.URLEnhancementTest,
  ronin.CacheTest,
  ronin.ControllerDispatchTest,
  ronin.FileUploadTest,
  ronin.HttpsTest,
  ronin.JSONPTest,
  ronin.LoginRequiredTest,
  ronin.MethodRestrictionTest,
  ronin.RedirectTest,
  ronin.RestrictedPropertiesTest,
  ronin.RoninTemplateTest,
  ronin.SimpleStringRenderTest,
  ronin.ToJSONTest,
  ronin.URLHandlerTest,
  ronin.URLUtilTest,
  ronin.UserAuthTest,
  ronin.XSRFTest
})
class RoninSuite {}