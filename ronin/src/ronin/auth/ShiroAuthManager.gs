package ronin.auth

uses ronin.Ronin
uses ronin.config.*
uses java.lang.*
uses java.util.*
uses gw.util.Pair
uses gw.lang.reflect.features.PropertyReference
uses javax.servlet.*
uses org.apache.shiro.SecurityUtils
uses org.apache.shiro.UnavailableSecurityManagerException
uses org.apache.shiro.mgt.SecurityManager
uses org.apache.shiro.mgt.DefaultSecurityManager
uses org.apache.shiro.authc.AuthenticationException
uses org.apache.shiro.authc.UsernamePasswordToken
uses org.apache.shiro.crypto.SecureRandomNumberGenerator
uses org.apache.shiro.crypto.hash.SimpleHash
uses org.apache.shiro.util.ThreadContext
uses org.apache.shiro.realm.AuthorizingRealm

/**
 *  Default implemenation of {@link ronin.config.IAuthManager}.
 */
class ShiroAuthManager implements IAuthManager {

  static var _rng = new SecureRandomNumberGenerator()
  var _hashAlgorithm : String
  var _hashIterations : int
  var _consoleSM : SecurityManager
  var _realmType : String

  construct(realm : AuthorizingRealm, hashAlgorithm : String, hashIterations : int, cfg : IRoninConfig) {
    _hashAlgorithm = hashAlgorithm
    _hashIterations = hashIterations
    _realmType = (typeof realm).Name
    var filter = new ShiroFilter(realm)
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
    _consoleSM = new DefaultSecurityManager(realm)
  }

  override property get CurrentUserName() : String {
    var subject = SecurityUtils.getSubject()
    if(subject.Authenticated) {
      var principal = subject.Principals.asList()[0]
      if(principal typeis ShiroPrincipalCollection) {
        return principal.Name
      } else {
        return principal as String
      }
    }
    return null
  }

  override property get CurrentUser() : Object {
    var subject = SecurityUtils.getSubject()
    if(subject.Authenticated) {
      var principal = subject.Principals.asList()[0]
      if(principal typeis ShiroPrincipalCollection) {
        return principal.User
      } else {
        return principal
      }
    }
    return null
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
    } catch (e : UnavailableSecurityManagerException) {
      if(ThreadContext.getSecurityManager() == null) {
        ThreadContext.bind(_consoleSM)
        try {
          return login(username, password)
        } finally {
          ThreadContext.unbindSecurityManager()
        }
      } else {
        return false
      }
    }
  }

  override function openidLogin(identity : String, email : String, idProvider : String) : boolean {
    try {
      SecurityUtils.getSubject().login(new OpenIDToken() {:Identity = identity, :Email = email, :IdProvider = idProvider})
      return true
    } catch (e : AuthenticationException) {
      return false
    }
  }

  override function logout() {
    SecurityUtils.getSubject().logout()
  }

  override function getPasswordHashAndSalt(password : String) : Pair<String, String> {
    if(_hashAlgorithm == null) {
      throw "Can't generate password hash and salt when using an authorizing realm of type ${_realmType}."
    }
    var salt = _rng.nextBytes()
    var hash = new SimpleHash(_hashAlgorithm, password, salt, _hashIterations).toBase64()
    return Pair.make(hash, salt.toBase64())
  }

}