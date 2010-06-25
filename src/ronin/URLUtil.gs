package ronin

uses gw.lang.parser.*
uses gw.lang.parser.expressions.*
uses gw.lang.reflect.*

uses java.net.URLEncoder
uses java.lang.ThreadLocal
uses java.lang.StringBuilder
uses gw.lang.function.IFunction0

class URLUtil {

  static var _prefix = new ThreadLocal<String>()

  static function urlFor(target : Object) : String {
    var args = (target as URLBlock).Args
    if(args[0] == null) {
      throw "Attempted to generate a URL from a non-existent method."
    }
    var mi = args[0] as IMethodInfo
    var actionName = mi.DisplayName
    var methodOwner = mi.OwnersType
    var parameters = mi.Parameters
    if( Type.isAssignableFrom( methodOwner ) )
    {
      methodOwner = (methodOwner as IMetaType).Type
    }
    if(!SimpleWebController.Type.isAssignableFrom(methodOwner)) {
      throw "Attempted to generate a URL from a method on a non-controller class"
    }
    var controllerName = methodOwner.RelativeName
    var prefix = _prefix.get()
    var url : StringBuilder
    if(prefix != null) {
      url = new StringBuilder(prefix)
    } else {
      url = new StringBuilder()
    }
    url.append(controllerName).append("/").append(actionName)
    if(args.Count > 1) {
      url.append("?")
      for (i in args.Count - 1) {
        var argValue = args[i + 1]
        if(parameters[i].Type.Array) {
          var arrayType = parameters[i].Type
          if(argValue != null) {
            var arrayLength = arrayType.getArrayLength(argValue)
            for(j in arrayLength) {
              var componentValue = arrayType.getArrayComponent(argValue, j)
              if(componentValue != null) {
                if(i > 0 || j > 0) {
                  url.append("&")
                }
                var stringValue = getStringValue(componentValue)
                url.append(URLEncoder.encode(parameters[i].getName(), "UTF-8")).append("[").append(j).append("]").append("=").append(URLEncoder.encode(stringValue.toString(), "UTF-8"))
              }
            }
          }
        } else {
          if(argValue != null) {
            if(i > 0) {
              url.append("&")
            }
            var stringValue = getStringValue(argValue)
            url.append(URLEncoder.encode(parameters[i].getName(), "UTF-8")).append("=").append(URLEncoder.encode(stringValue.toString(), "UTF-8"))
          }
        }
      }
    }
    return url.toString()
  }
  
  private static function getStringValue(argValue : Object) : String {
    var stringValue : String
    var idMethod = (typeof argValue).TypeInfo.getMethod("toID", {})
    if(idMethod != null) {
        return idMethod.CallHandler.handleCall(argValue, {}) as String
    } else {
        return argValue as String
    }
  }

  static function baseUrlFor(target : IMethodInfo) : String {
    var actionName = target.DisplayName
    var methodOwner = target.OwnersType
    if(methodOwner typeis IMetaType) {
      methodOwner = methodOwner.Type
    }
    if(!SimpleWebController.Type.isAssignableFrom(methodOwner)) {
      throw "Attempted to generate a URL from a method on a non-controller class"
    }
    var controllerName = methodOwner.RelativeName
    var prefix = _prefix.get()
    var url : StringBuilder
    if(prefix != null) {
      url = new StringBuilder(prefix)
    } else {
      url = new StringBuilder()
    }
    url.append(controllerName).append("/").append(actionName)
    return url.toString()
  }

  internal static function setPrefix(prefix : String) {
    _prefix.set(prefix)
  }
  
  static function makeURLBlock(args : List<Object>) : URLBlock {
    return new URLBlock() {:Args = args}
  }

  static class URLBlock implements IFunction0 {
    var _args : List<Object> as Args
  }

}