package ronin.test

uses java.lang.*
uses java.util.*

uses org.junit.Assert
uses org.junit.Test
uses org.junit.BeforeClass
uses org.junit.AfterClass

uses ronin.*
uses ronin.auth.*
uses ronin.config.*

uses controller.UserLogin

class UserAuthTest {

  static class User {
    var _name : String as Name
    var _hash : String as Hash
    var _salt : String as Salt
    var _id : String as ID
    var _roles : List<String> as Roles

    override function toString() : String {
      return _id
    }
  }

  static var _users : Map<String, User> = {}

  static final var USER1 = "User1"
  static final var ID1 = "user id 1"
  static final var PASSWORD1 = "p4SSword@$@%"
  static final var USER2 = "User2"
  static final var ID2 = "user id 2"
  static final var PASSWORD2 = "f00_b4rr"
  static final var ROLE1 = "Role1"
  static final var ROLE2 = "Role2"
  static final var ROLE3 = "Role3"

  @BeforeClass
  static function initAuthManager() {
    (RoninTest.RawConfig as DefaultRoninConfig).AuthManager = new ShiroAuthManager(
      \ username -> _users[username],
      \ identity, email, idProvider -> _users[email],
      User#Name, User#Hash, User#Salt, User#Roles,
      "SHA-256", 1024, Ronin.Config
    )
    var passHash = Ronin.Config.AuthManager.getPasswordHashAndSalt(PASSWORD1)
    _users[USER1] = new User() {:Name = USER1, :Hash = passHash.First, :Salt = passHash.Second,
      :ID = ID1, :Roles = {ROLE1, ROLE2}}
    passHash = Ronin.Config.AuthManager.getPasswordHashAndSalt(PASSWORD2)
    _users[USER2] = new User() {:Name = USER2, :Hash = passHash.First, :Salt = passHash.Second,
      :ID = ID2, :Roles = {}}
  }

  @Test
  function testLoginSuccess() {
    Assert.assertEquals("true", RoninTest.get(UserLogin#login(USER1, PASSWORD1)).WriterBuffer.toString())
  }

  @Test
  function testLoginFailure() {
    Assert.assertEquals("false", RoninTest.get(UserLogin#login(USER1, PASSWORD2)).WriterBuffer.toString())
  }

  @Test
  function testLogout() {
    Assert.assertEquals("null", RoninTest.get(UserLogin#logout(USER1, PASSWORD1)).WriterBuffer.toString())
  }

  @Test
  function testCurrentUser() {
    Assert.assertEquals(ID1, RoninTest.get(UserLogin#currentUser(USER1, PASSWORD1)).WriterBuffer.toString())
  }

  @Test
  function testCurrentUserName() {
    Assert.assertEquals(USER1, RoninTest.get(UserLogin#currentUserName(USER1, PASSWORD1)).WriterBuffer.toString())
  }

  @Test
  function testCurrentUserHasRole() {
    Assert.assertEquals("true", RoninTest.get(UserLogin#currentUserHasRole(USER1, PASSWORD1, ROLE1)).WriterBuffer.toString())
  }

  @Test
  function testCurrentUserDoesNotHaveRole() {
    Assert.assertEquals("false", RoninTest.get(UserLogin#currentUserHasRole(USER1, PASSWORD1, ROLE3)).WriterBuffer.toString())
  }

  @AfterClass
  static function clearAuthManager() {
    Ronin.Config.Filters.clear()
    (RoninTest.RawConfig as DefaultRoninConfig).AuthManager = null
  }

}