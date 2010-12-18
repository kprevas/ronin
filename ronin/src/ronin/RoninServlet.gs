package ronin

uses java.net.MalformedURLException
uses java.util.*
uses java.lang.*

uses javax.servlet.http.HttpServlet
uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse
uses javax.servlet.http.HttpSession

uses org.stringtree.json.*

uses gw.config.CommonServices

uses gw.lang.reflect.TypeSystem
uses gw.lang.reflect.IMethodInfo

uses gw.lang.parser.exceptions.IncompatibleTypeException
uses gw.lang.parser.exceptions.IEvaluationException
uses gw.lang.parser.exceptions.ErrantGosuClassException
uses gw.lang.parser.exceptions.ParseResultsException
uses gw.lang.parser.template.TemplateParseException
uses gw.util.Pair
uses gw.util.GosuExceptionUtil

class RoninServlet extends HttpServlet {

  var _defaultAction : String as DefaultAction
  var _defaultController : Type as DefaultController

  // Configuration hooks
  var _404Handler : block(e : FourOhFourException, req : HttpServletRequest, resp : HttpServletResponse) as FourOhFourHandler = \ e, req, resp -> {
    if(e.Cause != null) {
      log(e.Message, e.Cause)
    } else {
      log(e.Message)
    }
    resp.setStatus(404)
  }
  var _500Handler : block(e : FiveHundredException, req : HttpServletRequest, resp : HttpServletResponse) as FiveHundredHandler = \ e, req, resp -> {
    if(e.Cause != null) {
      log(e.Message, e.Cause)
    } else {
      log(e.Message)
    }
    resp.setStatus(500)
  }

  var _devMode = false

  construct(devMode : boolean) {
    _devMode = devMode
    defaultAction = "index"
    var config = TypeSystem.getByFullNameIfValid( "config.RoninConfig" )
    var instance = config?.TypeInfo?.getConstructor({})?.Constructor?.newInstance({})
    if(instance typeis IRoninConfig) {
      instance.init(this)
    }
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
        var controllerType : Type
        if(pathSplit.length < startIndex + 1) {
          if(_defaultController == null) {
            throw new MalformedURLException()
          } else {
            controllerType = _defaultController
          }
        } else {
          var controller = pathSplit[startIndex]
          controllerType = TypeSystem.getByFullNameIfValid("controller.${controller}")
          if(controllerType == null) {
            throw new FourOhFourException("Controller ${controller} not found.")
          }
        }
        var action : String
        if(pathSplit.length < startIndex + 2) {
          action = _defaultAction
        } else {
          action = pathSplit[startIndex + 1]
        }
        var actionMethod : IMethodInfo = null
        var params = new Object[0]
        for(method in controllerType.TypeInfo.Methods) {
          if(method.Public and method.DisplayName == action) {
            // TODO error if there's more than one
            var parameters = method.Parameters
            var reqParams = new ParameterAccess(req)
            params = new Object[parameters.Count]
            for (i in 0..|parameters.Count) {
              var parameterInfo = parameters[i]
              var paramName = parameterInfo.Name
              var paramType = parameterInfo.FeatureType
              if(paramType.Array) {
                var maxIndex = -1
                var paramValues = new HashMap<Integer, Object>()
                var propertyValueParams = new HashSet<String>()
                var componentType = paramType.ComponentType
                for(prop in reqParams.getArrayParameterValues(paramName)) {
                  var index = prop.First
                  maxIndex = Math.max(maxIndex, index)
                  var paramValue = prop.Second
                  try {
                    paramValues.put(index, convertValue(componentType, paramValue))
                  } catch (e : IncompatibleTypeException) {
                    throw new FiveHundredException("Could not coerce value ${paramValue} of parameter ${paramName} to type ${componentType.Name}", e)
                  }
                }
                for (prop in reqParams.getArrayPropertyParameterValues(paramName)) {
                  var index = prop.First
                  var propertyName = prop.Second.First
                  var propertyParamValue = prop.Second.Second
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
                  var propertyInfo = componentType.TypeInfo.getProperty(propertyName)
                  if(propertyInfo != null) {
                    var propertyType = propertyInfo.FeatureType
                    var propertyValue : Object
                    try {
                      propertyValue = convertValue(propertyType, propertyParamValue)
                    } catch (e : IncompatibleTypeException) {
                      throw new FiveHundredException("Could not coerce value ${propertyParamValue} of parameter ${paramName}[${index}].${propertyName} to type ${propertyType.Name}", e)
                    }
                    propertyInfo.Accessor.setValue(paramValue, propertyValue)
                  } else {
                    throw new FiveHundredException("Could not find property ${propertyName} on type ${componentType.Name}")
                  }
                }
                if(maxIndex > -1) {
                  var array = componentType.makeArrayInstance(maxIndex + 1)
                  for(j in 0..maxIndex) {
                    var paramValue = paramValues[j]
                    if(paramValue != null) {
                      paramType.setArrayComponent(array, j, paramValue)
                      params[i] = array
                    }
                  }
                }
              } else {
                var paramValue = reqParams.getParameterValue(paramName)
                if(paramValue != null or boolean == paramType) {
                  try {
                    params[i] = convertValue(paramType, paramValue)
                  } catch (e : IncompatibleTypeException) {
                    var factoryMethod = getFactoryMethod(paramType)
                    if(factoryMethod != null) {
                        try {
                          params[i] = factoryMethod.CallHandler.handleCall(null, {convertValue(factoryMethod.Parameters[0].FeatureType, paramValue)})
                        } catch (e2 : java.lang.Exception) {
                            throw new FiveHundredException("Could not retrieve instance of ${paramType} using ${factoryMethod} with argument ${paramValue}", e2)
                        }
                    } else {
                      throw new FiveHundredException("Could not coerce value ${paramValue} of parameter ${paramName} to type ${paramType.Name}", e)
                    }
                  }
                }
                for(prop in reqParams.getParameterProperties(paramName)) {
                  var propertyName = prop.First
                  paramValue = prop.Second
                  var propertyInfo = paramType.TypeInfo.getProperty(propertyName)
                  if(propertyInfo != null) {
                    var propertyType = propertyInfo.FeatureType
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
            actionMethod = method
            break
          }
        }
        if(actionMethod == null) {
          throw new FourOhFourException("Action ${action} not found.")
        }
        var writerProp = controllerType.TypeInfo.getProperty("Writer")
        var respProp = controllerType.TypeInfo.getProperty("Response")
        var reqProp = controllerType.TypeInfo.getProperty("Request")
        var postProp = controllerType.TypeInfo.getProperty("Method")
        var sessionProp = controllerType.TypeInfo.getProperty("Session")
        var referrerProp = controllerType.TypeInfo.getProperty("Referrer")
        var logProp = controllerType.TypeInfo.getProperty("log")
        if(writerProp == null or respProp == null or reqProp == null or postProp == null or sessionProp == null or referrerProp == null or logProp == null) {
          throw new FiveHundredException("ERROR - Controller ${controllerType.Name} does not subclass ronin.RoninController.")
        }
        writerProp.Accessor.setValue(null, out)
        respProp.Accessor.setValue(null, resp)
        reqProp.Accessor.setValue(null, req)
        postProp.Accessor.setValue(null, httpMethod)
        sessionProp.Accessor.setValue(null, new SessionMap(req.Session))
        referrerProp.Accessor.setValue(null, req.getHeader("referer"))
        logProp.Accessor.setValue(null, \s : String -> log(s))
        try {
          if(!actionMethod.Static) {
            throw new FiveHundredException("Method ${action} on controller ${controllerType.Name} must be defined as static.")
          }
          actionMethod.CallHandler.handleCall(null, params)
        } catch (e : Exception) {
          //TODO cgross - the logger jacks the errant gosu class message up horribly.
          //TODO cgross - is there a way around that?
          var cause = GosuExceptionUtil.findExceptionCause(e)
          if(e typeis ErrantGosuClassException) {
            print( "Invalid Gosu class was found : \n\n" + e.GsClass.ParseResultsException.Feedback + "\n\n" )
            throw new FiveHundredException("ERROR - Evaluation of method ${action} on controller ${controllerType.Name} failed because " + e.GsClass.Name + " is invalid.")
          } else if(cause typeis TemplateParseException) {
            print( "Invalid Gosu template was found : \n\n" + cause.Message + "\n\n" )
            throw new FiveHundredException("ERROR - Evaluation of method ${action} on controller ${controllerType.Name} failed.")
          } else if(cause typeis ParseResultsException) {
            print( "Gosu parse exception : \n\n" + cause.Feedback + "\n\n" )
            throw new FiveHundredException("ERROR - Evaluation of method ${action} on controller ${controllerType.Name} failed.")
          } else {
            log("Evaluation of method ${action} on controller ${controllerType.Name} failed.")
            throw new FiveHundredException("ERROR - Evaluation of method ${action} on controller ${controllerType.Name} failed.", e)
          }
        }
      } catch (e : FourOhFourException) {
        handle404(e, req, resp)
      } catch (e : FiveHundredException) {
        handle500(e, req, resp)
      }
    } else {
      // default?
    }

  }
  
  protected function handle404(e : FourOhFourException, req : HttpServletRequest, resp : HttpServletResponse) {
    FourOhFourHandler(e, req, resp)
  }
  
  protected function handle500(e : FiveHundredException, req : HttpServletRequest, resp : HttpServletResponse) {
    FiveHundredHandler(e, req, resp)
  }

  private function convertValue(paramType : Type, paramValue : String) : Object {
    if (paramType == boolean) {
      return "on".equals(paramValue) or "true".equals(paramValue)
    }
    if(not paramType.Primitive and not paramValue?.HasContent) {
      return null
    }
    var factoryMethod = getFactoryMethod(paramType)
    if(factoryMethod != null) {
      return factoryMethod.CallHandler.handleCall(null, {convertValue(factoryMethod.Parameters[0].FeatureType, paramValue)})
    } else {
      switch(paramType) {
      case int:
      case Integer:
        return Integer.parseInt(paramValue)
      case long:
      case Long:
        return Long.parseLong(paramValue)
      case float:
      case Float:
        return Float.parseFloat(paramValue)
      case double:
      case Double:
        return Double.parseDouble(paramValue)
      case java.util.Date:
        return new java.util.Date(paramValue)
      default:
        return CommonServices.getCoercionManager().convertValue(paramValue, paramType)
      }
    }
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

  protected class FourOhFourException extends Exception {
    construct(_reason : String) {
      super(_reason)
    }
    construct(_reason : String, _cause : Exception) {
      super(_reason, _cause)
    }
  }

  protected class FiveHundredException extends Exception {
    construct(_reason : String) {
      super(_reason)
    }
    construct(_reason : String, _cause : Exception) {
      super(_reason, _cause)
    }
  }

  private class ParameterAccess {

    var _req : HttpServletRequest
    var _json : boolean
    var _jsonObj : Map<Object, Object>

    construct(req : HttpServletRequest) {
      _req = req
      if(_req.ContentType?.split(";")?[0] == "text/json") {
        _json = true
        var body = new StringBuilder()
        var reader = _req.Reader
        var line = reader.readLine()
        while(line != null) {
          body.append(line).append("\n")
          line = reader.readLine()
        }
        var obj = new JSONValidatingReader().read(body.toString())
        if(obj typeis Map<Object, Object>) {
          _jsonObj = obj
        } else {
          throw new FiveHundredException("JSON did not parse as an object: ${obj}")
        }
      } else {
        _json = false
      }
    }

    function getParameterValue(name : String) : String {
      if(_json) {
        var value = _jsonObj[name]
        if(value typeis Map<Object, Object>) {
          return value["fromID"] as String
        } else {
          return value as String
        }
      } else {
        return _req.getParameter(name)
      }
    }

    function getParameterProperties(name : String) : List<Pair<String, String>> {
      var rtn = new ArrayList<Pair<String, String>>()
      if(_json) {
        var value = _jsonObj[name]
        if(value typeis Map<Object, Object>) {
          value.eachKeyAndValue(\k, v -> {
            if(k != "fromID") {
              rtn.add(Pair.make(k as String, v as String))
            }
          })
        }
      } else {
        var parameterNames = _req.getParameterNames()
        while(parameterNames.hasMoreElements()) {
          var reqParamName = parameterNames.nextElement().toString()
          if(reqParamName.startsWith(name + ".")) {
            var propertyName = reqParamName.substring((name + ".").Length)
            rtn.add(Pair.make(propertyName, _req.getParameter(reqParamName)))
          }
        }
      }
      return rtn
    }

    function getArrayParameterValues(name : String) : List<Pair<Integer, String>> {
      var rtn = new ArrayList<Pair<Integer, String>>()
      if(_json) {
        var value = _jsonObj[name]
        if(value typeis List<Object>) {
          value.eachWithIndex(\v, i -> {
            if(v typeis Map<Object, Object>) {
              rtn.add(Pair.make(i, v["fromID"] as String))
            } else {
              rtn.add(Pair.make(i, v as String))
            }
          })
        } else if(value != null) {
          throw new FiveHundredException("Expected an array value for parameter ${name}; got a ${typeof value}, ${value}")
        }
      } else {
        var parameterNames = _req.ParameterNames
        while(parameterNames.hasMoreElements()) {
          var reqParamName = parameterNames.nextElement().toString()
          if(reqParamName.startsWith(name) and reqParamName[name.Length] == "[") {
            if(reqParamName.lastIndexOf("]") == reqParamName.Length - 1) {
              var index : int
              try {
                index = Integer.decode(reqParamName.substring(name.Length + 1, reqParamName.Length - 1))
              } catch (e : NumberFormatException) {
                throw new FiveHundredException("Malformed indexed parameter ${reqParamName}", e)
              }
              rtn.add(Pair.make(index, _req.getParameter(reqParamName)))
            }
          }
        }
      }
      return rtn
    }

    function getArrayPropertyParameterValues(name : String) : List<Pair<Integer, Pair<String, String>>> {
      var rtn = new ArrayList<Pair<Integer, Pair<String, String>>>()
      if(_json) {
        var value = _jsonObj[name]
        if(value typeis List<Object>) {
          value.eachWithIndex(\v, i -> {
            if(v typeis Map<Object, Object>) {
              v.eachKeyAndValue(\key, val -> {
                if(key != "fromID") {
                  rtn.add(Pair.make(i, Pair.make(key as String, val as String)))
                }
              })
            }
          })
        }
      } else {
        var parameterNames = _req.ParameterNames
        while(parameterNames.hasMoreElements()) {
          var reqParamName = parameterNames.nextElement().toString()
          if(reqParamName.startsWith(name) and reqParamName[name.Length] == "[") {
            var index : int
            try {
              index = Integer.decode(reqParamName.substring(name.Length + 1, reqParamName.lastIndexOf("]")))
            } catch (e : NumberFormatException) {
              throw new FiveHundredException("Malformed indexed parameter ${reqParamName}", e)
            }
            if(reqParamName.lastIndexOf("]") != reqParamName.Length - 1 and reqParamName[reqParamName.lastIndexOf("]") + 1] == ".") {
              var propertyName = reqParamName.substring(reqParamName.lastIndexOf("]") + 2)
              var propertyValue = _req.getParameter(reqParamName)
              rtn.add(Pair.make(index, Pair.make(propertyName, propertyValue)))
            }
          }
        }
      }
      return rtn
    }

  }

}