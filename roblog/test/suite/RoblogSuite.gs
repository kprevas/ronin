package suite

uses org.junit.runner.RunWith
uses org.junit.runners.Suite
uses org.junit.runners.Suite.SuiteClasses

@RunWith(Suite)
@SuiteClasses({
  controller.AdminTest,
  controller.LoginTest,
  controller.PostTest
})
class RoblogSuite {}