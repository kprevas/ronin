package ronin.auth

uses java.lang.Iterable
uses gw.lang.reflect.features.PropertyReference

uses org.apache.shiro.authc.*
uses org.apache.shiro.authc.credential.HashedCredentialsMatcher
uses org.apache.shiro.authz.*
uses org.apache.shiro.codec.Base64
uses org.apache.shiro.realm.AuthorizingRealm
uses org.apache.shiro.subject.PrincipalCollection
uses org.apache.shiro.util.SimpleByteSource

class ShiroRealm extends AuthorizingRealm {

  var _getUser(username : String) : Object
  var _nameProp : PropertyReference<Object, String>
  var _passProp : PropertyReference<Object, String>
  var _saltProp : PropertyReference<Object, String>
  var _rolesProp : PropertyReference<Object, Iterable<String>>

  construct(getUser(username : String) : Object,
    userName : PropertyReference<Object, String>,
    userPassword : PropertyReference<Object, String>,
    userSalt : PropertyReference<Object, String>,
    userRoles : PropertyReference<Object, Iterable<String>>,
    hashAlgorithm : String, hashIterations : int) {
    super(new HashedCredentialsMatcher(hashAlgorithm) {
      :StoredCredentialsHexEncoded = false,
      :HashIterations = hashIterations
    })
    _getUser = getUser
    _nameProp = userName
    _passProp = userPassword
    _saltProp = userSalt
    _rolesProp = userRoles
  }

  override protected function doGetAuthorizationInfo(principals : PrincipalCollection) : AuthorizationInfo {
    return _rolesProp == null ? new SimpleAuthorizationInfo() :
      new SimpleAuthorizationInfo(_rolesProp.get(_getUser(principals.PrimaryPrincipal as String))?.toSet());
  }

  override protected function doGetAuthenticationInfo(token : AuthenticationToken) : AuthenticationInfo {
    var user = _getUser(token.Principal as String)
    if(user == null) {
      throw new UnknownAccountException()
    }
    return new SimpleAuthenticationInfo(_nameProp.get(user), _passProp.get(user),
      new SimpleByteSource(Base64.decode(_saltProp.get(user))), Name);
  }

}