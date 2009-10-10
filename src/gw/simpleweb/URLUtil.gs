package gw.simpleweb

uses gw.lang.parser.*
uses gw.lang.parser.expressions.*
uses gw.lang.reflect.*

uses java.net.URLEncoder
uses java.lang.ThreadLocal
uses java.lang.StringBuilder

internal class URLUtil {

  static var _prefix = new ThreadLocal<String>()

  static function urlFor(target : Object) : String {
    if(target == null) {
      throw "Attempted to generate a URL from a non-existent method."
    }
    var targetBlock = target as IBlockSymbol
    var body = targetBlock.Value
    var actionName : String
    var methodOwner : IType
    var argExpressions : IExpression[]
    var parameters : IParameterInfo[]
    if(body typeis IBeanMethodCallExpression) {
      actionName = body.MethodDescriptor.DisplayName
      methodOwner = body.MethodDescriptor.OwnersType
      argExpressions = body.Args
      parameters = body.MethodDescriptor.Parameters
    } else if (body typeis IMethodCallExpression) {
      actionName = body.FunctionType.MethodInfo.DisplayName
      methodOwner = body.FunctionType.MethodInfo.OwnersType
      argExpressions = body.Args
      parameters = body.FunctionType.MethodInfo.Parameters
    } else {
      throw "The body of a block used to generate a URL must be a single method call."
    }
    if( Type.isAssignableFrom( methodOwner ) )
    {
      methodOwner = (methodOwner as IMetaType).Type
    }
    if(!SimpleWebController.isAssignableFrom(methodOwner)) {
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
    if(argExpressions.length > 0) {
      url.append("?")
      targetBlock.prepareClosureSymbols()
      for (i in argExpressions.length) {
        var expression = argExpressions[i]
        if(parameters[i].Type.Array) {
          var arrayType = parameters[i].Type
          var array = expression.evaluate()
          if(array != null) {
            var arrayLength = arrayType.getArrayLength(array)
            for(j in arrayLength) {
              var componentValue = arrayType.getArrayComponent(array, j)
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
          var argValue = expression.evaluate()
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
      methodOwner = (methodOwner as IMetaType).Type
    }
    if(!SimpleWebController.isAssignableFrom(methodOwner)) {
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


}