package ronin.auth

uses java.lang.Iterable

uses org.apache.shiro.web.servlet.AbstractShiroFilter
uses org.apache.shiro.web.mgt.DefaultWebSecurityManager

internal class ShiroFilter extends AbstractShiroFilter {

  var _realm : ShiroRealm

  construct(realm : ShiroRealm) {
    _realm = realm
  }

  override function init() {
    SecurityManager = new DefaultWebSecurityManager(_realm)
  }

}