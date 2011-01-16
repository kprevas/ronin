package ronin.auth

uses java.lang.Iterable

uses gw.lang.reflect.features.PropertyReference

uses org.apache.shiro.web.servlet.AbstractShiroFilter
uses org.apache.shiro.web.mgt.DefaultWebSecurityManager

class ShiroFilter extends AbstractShiroFilter {

  var _realm : ShiroRealm

  construct(getUser(username : String) : Object,
    userName : PropertyReference<Object, String>,
    userPassword : PropertyReference<Object, String>,
    userSalt : PropertyReference<Object, String>,
    userRoles : PropertyReference<Object, Iterable<String>>,
    hashAlgorithm : String, hashIterations : int) {
    _realm = new ShiroRealm(getUser, userName, userPassword, userSalt, userRoles, hashAlgorithm, hashIterations)
  }

  override function init() {
    SecurityManager = new DefaultWebSecurityManager(_realm)
  }

}