package gw.simpleweb

uses java.net.MalformedURLException
uses java.util.*
uses java.lang.Math
uses java.lang.Integer
uses java.lang.Exception
uses java.lang.NumberFormatException
uses java.lang.UnsupportedOperationException

uses javax.servlet.http.HttpServlet
uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse
uses javax.servlet.http.HttpSession

uses gw.config.CommonServices

uses gw.lang.reflect.TypeSystem
uses gw.lang.reflect.IMethodInfo

uses gw.lang.parser.exceptions.IncompatibleTypeException
uses gw.lang.parser.exceptions.IEvaluationException

class SimpleWebServlet extends HttpServlet {

  static final var DEFAULT_ACTION = "index"

  var _devMode = false

  construct(devMode : boolean) {
    _devMode = devMode
  }

  override function doGet(req : HttpServletRequest, resp : HttpServletResponse) {
    handleRequest(req, resp, GET)
  }

  override function doPost(req : HttpServletRequest, resp : HttpServletResponse) {
    handleRequest(req, resp, POST)
  }

  override function doPut(req : HttpServletRequest, resp : HttpServletResponse) {
    handleRequest(req, resp, PUT)
  }

  override function doDelete(req : HttpServletRequest, resp : HttpServletResponse) {
    handleRequest(req, resp, DELETE)
  }

  function handleRequest(req : HttpServletRequest, resp : HttpServletResponse, httpMethod : HttpMethod) {
    if(_devMode) {
      TypeSystem.refresh()
    }
    URLUtil.setPrefix("${req.Scheme}://${req.ServerName}${req.ServerPort == 80 ? "" : (":" + req.ServerPort)}${req.ContextPath}${req.ServletPath}/")
    resp.ContentType = "text/html"
    var out = resp.Writer
    var path = req.PathInfo
    if(path != null) {
      try {
        var pathSplit = path.split("/")
        var startIndex = path.startsWith("/") ? 1 : 0
        if(pathSplit.length < startIndex + 1) {
          throw new MalformedURLException()
        }
        var controller = pathSplit[startIndex]
        var action : String
        if(pathSplit.length < startIndex + 2) {
          action = DEFAULT_ACTION
        } else {
          action = pathSplit[startIndex + 1]
        }
        var controllerType = TypeSystem.getByFullNameIfValid("controller.${controller}")
        if(controllerType == null) {
          throw new FourOhFourException("Controller ${controller} not found.")
        }
        var actionMethod : IMethodInfo = null
        var params = new Object[0]
        for(method in controllerType.TypeInfo.Methods) {
          if(method.Public && method.DisplayName == action) {
            // TODO error if there's more than one
            var parameters = method.Parameters
            params = new Object[parameters.Count]
            for (i in parameters.Count) {
              var parameterInfo = parameters[i]
              var paramName = parameterInfo.Name
              var paramType = parameterInfo.Type
              if(paramType.Array) {
                var maxIndex = -1
                var paramValues = new HashMap<Integer, Object>()
                var propertyValueParams = new HashSet<String>()
                var parameterNames = req.ParameterNames
                var componentType = paramType.ComponentType
                while(parameterNames.hasMoreElements()) {
                  var reqParamName = parameterNames.nextElement().toString()
                  if(reqParamName.startsWith(paramName) && reqParamName[paramName.length()] == "[") {
                    if(reqParamName.lastIndexOf("]") != reqParamName.length() - 1 && reqParamName[reqParamName.lastIndexOf("]") + 1] == ".") {
                      propertyValueParams.add(reqParamName)
                    } else {
                      var index : int
                      try {
                        index = Integer.decode(reqParamName.substring(paramName.length() + 1, reqParamName.length() - 1))
                      } catch (e : NumberFormatException) {
                        throw new FiveHundredException("Malformed indexed parameter ${reqParamName}", e)
                      }
                      maxIndex = Math.max(maxIndex, index)
                      var paramValue = req.getParameter(reqParamName)
                      try {
                        paramValues.put(index, convertValue(componentType, paramValue))
                      } catch (e : IncompatibleTypeException) {
                        throw new FiveHundredException("Could not coerce value ${paramValue} of parameter ${paramName} to type ${componentType.Name}", e)
                      }
                    }
                  }
                }
                for (propertyValueParam in propertyValueParams) {
                  var index : Integer
                  try {
                    index = Integer.decode(propertyValueParam.substring(paramName.length() + 1, propertyValueParam.lastIndexOf("]")))
                  } catch (e : NumberFormatException) {
                    throw new FiveHundredException("Malformed indexed parameter ${propertyValueParam}", e)
                  }
                  maxIndex = Math.max(maxIndex, index)
                  var paramValue = paramValues[index]
                  if(paramValue == null) {
                    var constructor = componentType.TypeInfo.getConstructor({})
                    if(constructor != null) {
                      paramValue = constructor.Constructor.newInstance({})
                    } else {
                      throw new FiveHundredException("Could not construct object of type ${paramType} implied by property parameters, because no no-arg constructor is defined.")
                    }
                    paramValues[index] = paramValue
                  }
                  var propertyName = propertyValueParam.substring(propertyValueParam.lastIndexOf("]") + 2)
                  var propertyInfo = componentType.TypeInfo.getProperty(propertyName)
                  if(propertyInfo != null) {
                    var propertyType = propertyInfo.Type
                    var propertyParamValue = req.getParameter(propertyValueParam)
                    var propertyValue : Object
                    try {
                      propertyValue = convertValue(propertyType, propertyParamValue)
                    } catch (e : IncompatibleTypeException) {
                      throw new FiveHundredException("Could not coerce value ${propertyParamValue} of parameter ${propertyValueParam} to type ${propertyType.Name}", e)
                    }
                    propertyInfo.Accessor.setValue(paramValue, propertyValue)
                  } else {
                    throw new FiveHundredException("Could not find property ${propertyName} on type ${componentType.Name}")
                  }
                }
                if(maxIndex > -1) {
                  var array = componentType.makeArrayInstance(maxIndex + 1)
                  for(j in (maxIndex + 1)) {
                    var paramValue = paramValues[j]
                    if(paramValue != null) {
                      paramType.setArrayComponent(array, j, paramValue)
                      params[i] = array
                    }
                  }
                }
              } else {
                var paramValue = req.getParameter(paramName)
                if(paramValue != null || boolean == paramType) {
                  try {
                    params[i] = convertValue(paramType, paramValue)
                  } catch (e : IncompatibleTypeException) {
                    var factoryMethod = getFactoryMethod(paramType)
                    if(factoryMethod != null) {
                        try {
	                        params[i] = factoryMethod.CallHandler.handleCall(null, {convertValue(factoryMethod.Parameters[0].Type, paramValue)})
                        } catch (e2 : java.lang.Exception) {
                            throw new FiveHundredException("Could not retrieve instance of ${paramType} using ${factoryMethod} with argument ${paramValue}", e2)
                        }
                    } else {
	                    throw new FiveHundredException("Could not coerce value ${paramValue} of parameter ${paramName} to type ${paramType.Name}", e)
                    }
                  }
                }
                var parameterNames = req.getParameterNames()
                while(parameterNames.hasMoreElements()) {
                  var reqParamName = parameterNames.nextElement().toString()
                  if(reqParamName.startsWith(paramName + ".")) {
                    var propertyName = reqParamName.substring((paramName + ".").length())
                    var propertyInfo = paramType.TypeInfo.getProperty(propertyName)
                    if(propertyInfo != null) {
                      var propertyType = propertyInfo.Type
                      paramValue = req.getParameter(reqParamName)
                      var propertyValue : Object
                      try {
                        propertyValue = convertValue(propertyType, paramValue)
                      } catch (e : IncompatibleTypeException) {
                        throw new FiveHundredException("Could not coerce value ${paramValue} of parameter ${paramName} to type ${propertyType.Name}", e)
                      }
                      if(params[i] == null) {
                        var constructor = paramType.TypeInfo.getConstructor({})
                        if(constructor != null) {
                          params[i] = constructor.Constructor.newInstance({})
                        } else {
                          throw new FiveHundredException("Could not construct object of type ${paramType} implied by property parameters, because no no-arg constructor is defined.")
                        }
                      }
                      propertyInfo.Accessor.setValue(params[i], propertyValue)
                    } else {
                      throw new FiveHundredException("Could not find property ${propertyName} on type ${paramType.Name}")
                    }
                  }
                }
              }
            }
            actionMethod = method
            break
          }
        }
        if(actionMethod == null) {
          throw new FourOhFourException("Action ${action} not found.")
        }
        var writerProp = controllerType.TypeInfo.getProperty("writer")
        var respProp = controllerType.TypeInfo.getProperty("response")
        var reqProp = controllerType.TypeInfo.getProperty("request")
        var postProp = controllerType.TypeInfo.getProperty("method")
        var sessionProp = controllerType.TypeInfo.getProperty("session")
        var refererProp = controllerType.TypeInfo.getProperty("referer")
        if(writerProp == null || respProp == null || postProp == null || sessionProp == null) {
          throw new FiveHundredException("ERROR - Controller ${controller} does not subclass gw.simpleweb.SimpleWebController.")
        }
        writerProp.Accessor.setValue(null, out)
        respProp.Accessor.setValue(null, resp)
        reqProp.Accessor.setValue(null, req)
        postProp.Accessor.setValue(null, httpMethod)
        sessionProp.Accessor.setValue(null, new SessionMap(req.Session))
        refererProp.Accessor.setValue(null, req.getHeader("referer"))
        try {
          if(!actionMethod.Static) {
            throw new FiveHundredException("Method ${action} on controller ${controller} must be defined as static.")
          }
          actionMethod.CallHandler.handleCall(null, params)
        } catch (e : IEvaluationException) {
          log("Evaluation of method ${action} on controller ${controller} failed.", e)
          throw e
        }
      } catch (e : FourOhFourException) {
        if(e.Cause != null) {
          log(e.Message, e.Cause)
        } else {
          log(e.Message)
        }
        resp.setStatus(404)
      } catch (e : FiveHundredException) {
        if(e.Cause != null) {
          log(e.Message, e.Cause)
        } else {
          log(e.Message)
        }
        resp.setStatus(500)
      }
    } else {
      // default?
    }

  }

  private function convertValue(paramType : Type, paramValue : String) : Object {
    if (paramType == boolean) {
      return "on".equals(paramValue) or "true".equals(paramValue)
    }
    return CommonServices.getCoercionManager().convertValue(paramValue, paramType)
  }
  
  private function getFactoryMethod(type : Type) : IMethodInfo {
    for(var method in type.TypeInfo.Methods) {
      if(method.Static and method.DisplayName == "fromID" and method.ReturnType.Name == type.Name and method.Parameters.Count == 1) {
        return method
      }
    }
    return null
  }

  private class SessionMap implements Map<String, Object> {

    var _session : HttpSession

    construct(session : HttpSession) {
      _session = session
    }

    override function clear() {
      throw new UnsupportedOperationException()
    }

    override function containsKey(key : String) : boolean {
      var keys = _session.AttributeNames
      while(keys.hasMoreElements()) {
        if(keys.nextElement() == key) {
          return true
        }
      }
      return false
    }

    override function containsValue(value : Object) : boolean {
      var keys = _session.AttributeNames
      while(keys.hasMoreElements()) {
        if(_session.getAttribute(keys.nextElement() as String) == value) {
          return true
        }
      }
      return false
    }

    override function entrySet() : Set<Map.Entry<String, Object>> {
      throw new UnsupportedOperationException()
    }

    override function get(key : String) : Object {
      return _session.getAttribute(key)
    }

    override property get Empty() : boolean {
      return _session.AttributeNames.hasMoreElements()
    }

    override function keySet() : Set<String> {
      throw new UnsupportedOperationException()
    }

    override function put(key : String, value : Object) : Object {
      var oldVal = _session.getAttribute(key)
      _session.setAttribute(key, value)
      return oldVal
    }

    override function putAll(m : Map<String, Object>) {
      m.eachKeyAndValue(\ k, v -> put(k, v))
    }

    override function remove(key : String) : Object {
      var oldVal = _session.getAttribute(key)
      _session.removeAttribute(key)
      return oldVal
    }

    override function size() : int {
      var count = 0
      var keys = _session.AttributeNames
      while(keys.hasMoreElements()) {
        keys.nextElement()
        count++
      }
      return count
    }

    override function values() : Collection<Object> {
      throw new UnsupportedOperationException()
    }

  }

  private class FourOhFourException extends Exception {
    construct(_reason : String) {
      super(_reason)
    }
    construct(_reason : String, _cause : Exception) {
      super(_reason, _cause)
    }
  }

  private class FiveHundredException extends Exception {
    construct(_reason : String) {
      super(_reason)
    }
    construct(_reason : String, _cause : Exception) {
      super(_reason, _cause)
    }
  }

}