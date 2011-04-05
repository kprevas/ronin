package ronin

uses gw.lang.*
uses gw.lang.reflect.*
uses gw.lang.reflect.features.*

uses java.lang.ThreadLocal
uses java.util.*
uses java.lang.*
uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse

/**
 *  Provides convenience methods for Ronin templates.
 */
class RoninTemplate implements IRoninUtils {

  static function beforeRender(template : gw.lang.reflect.IType, w : java.io.Writer) {
    RoninRequest.beforeRenderTemplate(template)
  }

  static function afterRender(template : gw.lang.reflect.IType, w : java.io.Writer) {
    RoninRequest.afterRenderTemplate(template)
  }

  /**
   *  Escapes a string for HTML.
   *  @param x The string to be escaped.
   *  @return the escaped string.
   */
  static function h(x : String) : String {
    return x == null ? "" :
    x.replace("&", "&amp;")
     .replace("<", "&lt;")
     .replace(">", "&gt;")
     .replace("\"", "&quot;")
  }
  
  /**
   *  Escapes a string for a Gosu string literal.
   *  @param x The string to be escaped.
   *  @return the escaped string.
   */
  static function g(x : String) : String {
    return x == null ? "" :
    x.replace("\"", "\\\"")
     .replace("\<%", "\\\<%")
     .replace("\${", "\\\${")
  }

  /**
   *  Pass the return value of this method to a using() statement to designate a section of the template
   *  whose purpose is to submit form values via a POST request.
   *  @param target The method which will be called by the request.  Arguments should be unbound.
   *  @return An object to pass to a using() statement.
   */
  static function target(target : MethodReference) : FormTarget {
    return new FormTarget(target)
  }

  /**
   *  Within a using(target()) block, the URL to which the POST should be submitted.
   */
  static property get TargetURL() : String {
    if(RoninRequest.FormTarget == null) {
      throw "TargetURL property used outside of using(target()) block."
    }
    return postUrlFor(RoninRequest.FormTarget)
  }

  @URLMethodValidator
  @Deprecated("Block-based methods have been deprecated.  Use urlFor(Foo#bar()) instead.")
  static function urlFor(target() : void) : String {
    return URLUtil.urlFor(target)
  }

  @Deprecated("IMethodInfo-based methods have been deprecated.  Use postUrlFor(Foo#bar()) instead.")
  static function postUrlFor(target : gw.lang.reflect.IMethodInfo) : String {
    return URLUtil.baseUrlFor(target)
  }

  /**
   *  Within a using(target()) block, generates the parameter name or dot path for a given value, type,
   *  or property reference, appropriate for use as an HTML input element's name attribute.
   *  @param obj A value, type literal, or property reference.
   *  @return The parameter name.
   */
  static function n(obj : Object) : String {
    var target = RoninRequest.FormTarget
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

  /**
   *  Within a using(target()) block, generates the parameter name or dot path for a given value, type,
   *  or property reference, appropriate for use as an HTML input element's name attribute, for a parameter
   *  which expects an array.
   *  @param obj A value, type literal, or property reference.
   *  @param index The desired index of the associated value in the array passed in to the parameter.
   *  @return The parameter name.
   */
  static function n(obj : Object, index : int) : String {
    var target = RoninRequest.FormTarget
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

  /**
   *  Within a using(target()) block, generates the parameter name for the target method's parameter at the
   *  given index.
   *  @param index The index of the parameter in the target method's parameter list.
   *  @return The parameter name.
   */
  static function n(index : int) : String {
    var target = RoninRequest.FormTarget
    if(target == null) {
      throw "n() used outside of using(target()) block."
    }
    var params = target.MethodInfo.Parameters
    if(params.Count <= index) {
      throw "Controller method ${target.MethodInfo.Name} has only ${params.Count} parameters."
    }
    var param = target.MethodInfo.Parameters[index]
    return param.Name
  }

  /**
   *  Within a using(target()) block, generates the parameter name for the target method's parameter at the
   *  given index, for a parameter which expects an array.
   *  @param index The index of the parameter in the target method's parameter list.
   *  @param index The desired index of the associated value in the array passed in to the parameter.
   *  @return The parameter name.
   */
  static function n(paramIndex : int, arrayIndex : int) : String {
    return "${n(paramIndex)}[${arrayIndex}]"
  }

  /**
   *  An object which, when passed to a using() statement, denotes a section of the template used to
   *  submit form values via a POST request.
   */
  static class FormTarget implements IReentrant {

    var _t : MethodReference
    var _parent : MethodReference

    construct(target : MethodReference) {
      _t = target
    }

    function enter() {
      _parent = Ronin.CurrentRequest.FormTarget
      Ronin.CurrentRequest.FormTarget = _t
    }

    function exit() {
      Ronin.CurrentRequest.FormTarget = _parent
    }
  }

}