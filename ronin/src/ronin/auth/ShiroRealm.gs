package ronin.auth

uses java.lang.Iterable
uses gw.lang.reflect.features.PropertyReference

uses org.apache.shiro.authc.*
uses org.apache.shiro.authc.credential.HashedCredentialsMatcher
uses org.apache.shiro.authz.*
uses org.apache.shiro.codec.Base64
uses org.apache.shiro.realm.AuthorizingRealm
uses org.apache.shiro.subject.*
uses org.apache.shiro.util.SimpleByteSource

internal class ShiroRealm extends AuthorizingRealm {

  var _getUser(username : String) : Object
  var _getOrCreateUserByEmail(email : String, idProvider : String) : Object
  var _nameProp : PropertyReference<Object, String>
  var _passProp : PropertyReference<Object, String>
  var _saltProp : PropertyReference<Object, String>
  var _rolesProp : PropertyReference<Object, Iterable<String>>

  construct(getUser(username : String) : Object,
    getOrCreateUserByEmail(email : String, idProvider : String) : Object,
    userName : PropertyReference<Object, String>,
    userPassword : PropertyReference<Object, String>,
    userSalt : PropertyReference<Object, String>,
    userRoles : PropertyReference<Object, Iterable<String>>,
    hashAlgorithm : String, hashIterations : int) {
    super(new OpenIDAwareCredentialsMatcher(hashAlgorithm) {
      :StoredCredentialsHexEncoded = false,
      :HashIterations = hashIterations
    })
    _getUser = getUser
    _getOrCreateUserByEmail = getOrCreateUserByEmail
    _nameProp = userName
    _passProp = userPassword
    _saltProp = userSalt
    _rolesProp = userRoles
  }

  override protected function doGetAuthorizationInfo(principals : PrincipalCollection) : AuthorizationInfo {
    return _rolesProp == null ? new SimpleAuthorizationInfo() :
      new SimpleAuthorizationInfo(_rolesProp.get((principals.asList()[0] as ShiroPrincipalCollection).User)?.toSet());
  }

  override protected function doGetAuthenticationInfo(token : AuthenticationToken) : AuthenticationInfo {
    if(token typeis OpenIDToken and _getOrCreateUserByEmail != null) {
      var user = _getOrCreateUserByEmail(token.Email, token.IdProvider)
      if(user == null) {
        throw new UnknownAccountException()
      }
      return new SimpleAuthenticationInfo(new ShiroPrincipalCollection(){:User = user, :Name = _nameProp.get(user)},
        new SimpleByteSource(""), new SimpleByteSource(""), Name);
    } else {
      var user = _getUser(token.Principal as String)
      if(user == null) {
        throw new UnknownAccountException()
      }
      return new SimpleAuthenticationInfo(new ShiroPrincipalCollection(){:User = user, :Name = _nameProp.get(user)},
        _passProp.get(user), new SimpleByteSource(Base64.decode(_saltProp.get(user))), Name);
    }
  }

  override function supports(token : AuthenticationToken) : boolean {
    return super.supports(token) or token typeis OpenIDToken
  }

  private static class OpenIDAwareCredentialsMatcher extends HashedCredentialsMatcher {

    construct(hashAlgorithm : String) {
      super(hashAlgorithm)
    }

    override function doCredentialsMatch(token : AuthenticationToken, info : AuthenticationInfo) : boolean {
      if(token typeis OpenIDToken) {
        return true
      }
      return super.doCredentialsMatch(token, info)
    }

  }

}