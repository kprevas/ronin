package ronin

uses gw.lang.reflect.features.*
uses java.lang.ThreadLocal
uses java.util.*
uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse

class RoninTemplate {

  static var _target = new ThreadLocal<MethodReference>()

  static function h(x : String) : String {
    return x == null ? "" :
    x.replace("&", "&amp;")
     .replace("<", "&lt;")
     .replace(">", "&gt;")
     .replace("\"", "&quot;")
  }
  
  static function g(x : String) : String {
    return x == null ? "" :
    x.replace("\"", "\\\"")
     .replace("\<%", "\\\<%")
     .replace("\${", "\\\${")
  }

  static function target(target : MethodReference) : FormTarget {
    return new FormTarget(target)
  }

  static property get TargetURL() : String {
    if(_target.get() == null) {
      throw "TargetURL property used outside of using(target()) block."
    }
    return postUrlFor(_target.get())
  }

  @URLMethodValidator
  static function urlFor(target : MethodReference) : String {
    return URLUtil.urlFor(target)
  }

  static function postUrlFor(target : MethodReference) : String {
    return URLUtil.baseUrlFor(target)
  }

  @URLMethodValidator
  @Deprecated("Block-based methods have been deprecated.  Use urlFor(Foo#bar()) instead.")
  static function urlFor( target() : void ) : String {
    return URLUtil.urlFor(target)
  }

  @Deprecated("IMethodInfo-based methods have been deprecated.  Use postUrlFor(Foo#bar()) instead.")
  static function postUrlFor( target : gw.lang.reflect.IMethodInfo) : String {
    return URLUtil.baseUrlFor(target)
  }
  
  static property get Session() : Map<String, Object> {
    return RoninController.Session
  }

  static property get Request() : HttpServletRequest {
    return RoninController.Request
  }

  static property get Response() : HttpServletResponse {
    return RoninController.Response
  }

  static function n(obj : Object) : String {
    var target = _target.get()
    if(target == null) {
      throw "n() used outside of using(target()) block."
    }
    if(obj typeis Type) {
      var param = target.MethodInfo.Parameters.firstWhere(\p -> p.FeatureType.isAssignableFrom(obj))
      if(param != null) {
        return param.Name
      } else {
        throw "Controller method ${target.MethodInfo.Name} has no parameter of type ${obj}."
      }
    } else if(obj typeis IPropertyReference) {
      var rootType = obj.RootType
      var param = target.MethodInfo.Parameters.firstWhere(\p -> p.FeatureType.isAssignableFrom(rootType))
      if(param != null) {
        var propertyName = obj.PropertyInfo.Name
        return "${param.Name}.${propertyName}"
      } else {
        throw "Controller method ${target.MethodInfo.Name} has no parameter of type ${rootType}."
      }
    } else {
      var param = target.MethodInfo.Parameters.firstWhere(\p -> p.FeatureType.isAssignableFrom(typeof obj))
      if(param != null) {
        return param.Name
      } else {
        throw "Controller method ${target.MethodInfo.Name} has no parameter of type ${typeof obj}."
      }
    }
  }

  static function n(obj : Object, index : int) : String {
    var target = _target.get()
    if(target == null) {
      throw "n() used outside of using(target()) block."
    }
    if(obj typeis Type) {
      var arrayType = obj.ArrayType
      return "${n(arrayType)}[${index}]"
    } else if(obj typeis IPropertyReference) {
      var rootType = obj.RootType
      if(rootType.Array) {
        var param = target.MethodInfo.Parameters.firstWhere(\p -> p.FeatureType.isAssignableFrom(rootType))
        if(param != null) {
          var propertyName = obj.PropertyInfo.Name
          return "${param.Name}[${index}].${propertyName}"
        } else {
          throw "Controller method ${target.MethodInfo.Name} has no parameter of type ${rootType}."
        }
      } else {
        return "${n(obj)}[${index}]"
      }
    } else {
      return "${n((typeof obj).ArrayType)}[${index}]"
    }
  }

  static class FormTarget {

    var _t : MethodReference

    construct(target : MethodReference) {
      _t = target
    }

    function lock() {
      _target.set(_t)
    }

    function unlock() {
      _target.remove()
    }
    
  }

}