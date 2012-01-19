package controller

uses java.lang.*
uses org.junit.*
uses ronin.test.*

uses org.openqa.selenium.*
uses org.openqa.selenium.htmlunit.HtmlUnitDriver

@UITest
class LoginTest extends Assert {

  var _driver : HtmlUnitDriver

  @Before function setupDriver() {
    _driver = new HtmlUnitDriver() {:JavascriptEnabled = true}
    _driver.get("http://localhost:${System.getProperty("ronin.test.port")}")
  }

  @Test function testViewPost() {
    _driver.findElement(By.linkText("Login")).click()
    _driver.findElement(By.name("name")).sendKeys({"admin"})
    _driver.findElement(By.name("pass")).sendKeys({"password"})
    _driver.findElement(By.xpath("//input[@type='submit']")).click()
    _driver.findElement(By.linkText("Logout")) // wait for logout link to appear
    assertTrue(_driver.findElement(By.id("loginLogout")).getText().contains("Logged in as admin"))
  }

}