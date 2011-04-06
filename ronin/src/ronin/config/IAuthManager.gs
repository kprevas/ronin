package ronin.config

uses gw.util.Pair

/**
 *  Represents an object responsible for handling authentication and authorization tasks in a Ronin app.
 */
interface IAuthManager {

  /**
   *  @return The currently logged in user, or null if no user is logged in.
   */
  property get CurrentUser() : Object

  /**
   *  @return The currently logged in user's username, or null if no user is logged in.
   */
  property get CurrentUserName() : String

  /**
   *  @param role The name of a role.
   *  @return True if a user is logged in and has the specified role.
   */
  function currentUserHasRole(role : String) : boolean

  /**
   *  Attempts to log in a user with the given credentials.
   *  @param username The user's username.
   *  @param password The user's (plaintext) password.
   *  @return True if the user was successfully logged in with the given credentials.
   */
  function login(username : String, password : String) : boolean

  /**
   *  Responds to an OpenID-based login with the given identity and/or e-mail address.  If a user who has previously claimed the
   *  given credentials exists, that user is logged in.  Otherwise, a new user may be created, associated with the credentials
   *  given, and logged in.
   *  @param identity The identity string provided by the OpenID provider.
   *  @param email The e-mail address provided by the OpenID provider.
   *  @param idProvider The OpenID provider.
   *  @return True if a user (new or existing) was successfully logged in with the given credentials.
   */
  function openidLogin(identity : String, email : String, idProvider : String) : boolean

  /**
   *  Logs out the current user.  No effect if a user is not logged in.
   */
  function logout()

  /**
   *  Hashes the given password, generating a salt to protect against dictionary attacks.
   *  @param password The plaintext password.
   *  @return A {@link gw.util.Pair} object containing the hashed password (pair.First) and the salt (pair.Second).
   */
  function getPasswordHashAndSalt(password : String) : Pair<String, String>

}