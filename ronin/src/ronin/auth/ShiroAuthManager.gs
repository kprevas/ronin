package ronin.auth

uses ronin.Ronin
uses ronin.config.*
uses java.lang.*
uses java.util.*
uses gw.util.Pair
uses gw.lang.reflect.features.PropertyReference
uses javax.servlet.*
uses org.apache.shiro.SecurityUtils
uses org.apache.shiro.authc.AuthenticationException
uses org.apache.shiro.authc.UsernamePasswordToken
uses org.apache.shiro.crypto.SecureRandomNumberGenerator
uses org.apache.shiro.crypto.hash.SimpleHash

/**
 *  Default implemenation of {@link ronin.config.IAuthManager}.
 */
class ShiroAuthManager implements IAuthManager {

  static var _rng = new SecureRandomNumberGenerator()
  var _hashAlgorithm : String
  var _hashIterations : int

  construct(getUser(username : String) : Object,
    userName : PropertyReference<Object, String>,
    userPassword : PropertyReference<Object, String>,
    userSalt : PropertyReference<Object, String>,
    userRoles : PropertyReference<Object, Iterable<String>>,
    hashAlgorithm : String, hashIterations : int, cfg : IRoninConfig) {
    _hashAlgorithm = hashAlgorithm
    _hashIterations = hashIterations
    var filter = new ShiroFilter(getUser, userName, userPassword, userSalt, userRoles, hashAlgorithm, hashIterations)
    filter.init(new FilterConfig() {
      override property get FilterName() : String {
        return ""
      }
      override function getInitParameter(s : String) : String {
        return null
      }
      override property get InitParameterNames() : Enumeration<String> {
        return null
      }
      override property get ServletContext() : ServletContext {
        return null
      }
    })
    cfg.Filters.add(filter)
  }

  override property get CurrentUserName() : String {
    var subject = SecurityUtils.getSubject()
    return subject.Authenticated ? (subject.Principals.asList()[0] as ShiroPrincipalCollection).Name : null
  }

  override property get CurrentUser() : Object {
    var subject = SecurityUtils.getSubject()
    return subject.Authenticated ? (subject.Principals.asList()[0] as ShiroPrincipalCollection).User : null
  }

  override function currentUserHasRole(role : String) : boolean {
    var subject = SecurityUtils.getSubject()
    return subject.Authenticated ? subject.hasRole(role) : false
  }

  override function login(username : String, password : String) : boolean {
    try {
      SecurityUtils.getSubject().login(new UsernamePasswordToken(username, password))
      return true
    } catch (e : AuthenticationException) {
      return false
    }
  }

  override function logout() {
    SecurityUtils.getSubject().logout()
  }

  override function getPasswordHashAndSalt(password : String) : Pair<String, String> {
    var salt = _rng.nextBytes()
    var hash = new SimpleHash(_hashAlgorithm, password, salt, _hashIterations).toBase64()
    return Pair.make(hash, salt.toBase64())
  }

}