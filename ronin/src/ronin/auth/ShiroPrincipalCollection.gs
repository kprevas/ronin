package ronin.auth

uses java.lang.*
uses java.util.*
uses org.apache.shiro.subject.*

internal class ShiroPrincipalCollection implements PrincipalCollection {

  var _user : Object as User
  var _name : String as Name

  override function asList() : List {
    return {_name, _user}
  }

  override function asSet() : Set {
    return {_name, _user}  
  }

  override function byType<T>(clazz : Class<T>) : Collection<T> {
    if(T.isAssignableFrom(Object)) {
      return {_name, _user} as Collection<T>
    }
    if(T.isAssignableFrom(String)) {
      return {_name} as Collection<T>
    }
    return {}
  }

  override function fromRealm(realm : String) : Collection {
    return asList()
  }

  override property get PrimaryPrincipal() : Object {
    return _name
  }

  override property get RealmNames() : Set<String> {
    return {}
  }

  override property get Empty() : boolean {
    return false
  }

  override function oneByType<T>(clazz : Class<T>) : T {
    return asList()[0] as T
  }

  override function iterator() : Iterator {
    return asList().iterator()
  }

}