package ronin.auth

uses java.lang.Iterable

uses org.apache.shiro.web.servlet.AbstractShiroFilter
uses org.apache.shiro.web.mgt.DefaultWebSecurityManager
uses org.apache.shiro.realm.AuthorizingRealm

internal class ShiroFilter extends AbstractShiroFilter {

  var _realm : AuthorizingRealm

  construct(realm : AuthorizingRealm) {
    _realm = realm
  }

  override function init() {
    SecurityManager = new DefaultWebSecurityManager(_realm)
  }

}