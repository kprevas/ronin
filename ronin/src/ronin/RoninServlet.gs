package ronin

uses controller.OpenID
uses gw.internal.gosu.parser.*
uses gw.lang.parser.exceptions.*
uses gw.lang.parser.template.*
uses gw.lang.reflect.*
uses gw.util.*
uses org.apache.commons.fileupload.FileItem
uses org.jschema.util.JSchemaUtils
uses ronin.config.*

uses javax.servlet.FilterChain
uses javax.servlet.http.*
uses java.io.*
uses java.lang.*
uses java.util.*
uses java.net.*

/**
 * The servlet responsible for handling Ronin requests.
 */
class RoninServlet extends AbstractRoninServlet {

  var _roninFilter = new RoninFilter()

  construct(mode : String, src : File = null) {
    Ronin.init(this, ApplicationMode.fromShortName(mode), src)
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

    if(Ronin.Mode == DEVELOPMENT) {
      Ronin.loadChanges()
    }

    var prefix = "${req.Scheme}://${req.ServerName}${req.ServerPort == 80 ? "" : (":" + req.ServerPort)}${req.ContextPath}${req.ServletPath}/"
    using(new RoninRequest(prefix, resp, req, httpMethod, new SessionMap(req.Session), req.getHeader("referer"))) {
      doHandleRequest(req, resp, httpMethod)
      if(Ronin.TraceEnabled) {
        for(str in Ronin.CurrentTrace.toString().split("\n")) {
          Ronin.log(str, INFO, "Ronin", null)
        }
      }
    }
  }

  private function doHandleRequest(req : HttpServletRequest, resp : HttpServletResponse, httpMethod : HttpMethod) {
    resp.ContentType = "text/html"
    var out = resp.Writer
    var path = req.PathInfo

    resp.setHeader("X-XRDS-Location", IRoninUtils.urlFor(controller.OpenID#xrds()))
    if(Ronin.Config.XSRFLevel.contains(httpMethod)) {
      Ronin.CurrentRequest.checkXSRF()
    }
    using(var trace = Ronin.CurrentTrace?.withMessage("request for ${path} " + showArgs(req)),
          var observer = new RoninTemplateObserver()) {
      if(path != null) {
        try {
          var actionMethodAndControllerInstance = getActionMethodAndControllerInstance(path.startsWith("/") ? path.substring(1) : path)
          var actionMethod = actionMethodAndControllerInstance.First
          if(actionMethod == null) {
            throw new FourOhFourException("Action for ${path} not found.")
          }
          var params = new Object[0]
          var reqParams = new ParameterAccess(req)
          var files : List<FileItem> = {}
          var jsonpCallback : String = null
          if(Ronin.Config.ServletFileUpload.isMultipartContent(req)) {
            files = Ronin.Config.ServletFileUpload.parseRequest(req) as List<FileItem>
          }
          checkMethodPermitted(actionMethod, httpMethod)
          checkHttps(actionMethod, req.Scheme)
          if(not checkLogin(actionMethod, req.FullURL)) {
            return
          }
          jsonpCallback = getJsonpCallback(actionMethod, reqParams)
          var parameters = actionMethod.Parameters
          params = new Object[parameters.Count]
          for (i in 0..|parameters.Count) {
            var parameterInfo = parameters[i]
            var paramName = parameterInfo.Name
            var paramType = parameterInfo.FeatureType
            if(paramType.isAssignableFrom(byte[]) or paramType.isAssignableFrom(InputStream)) {
              var file = files.firstWhere(\f -> f.FieldName == paramName)
              if(file != null) {
                if(paramType.isAssignableFrom(byte[])) {
                  params[i] = file.get()
                } else {
                  params[i] = file.InputStream
                }
              }
            } else if(paramType.Array) {
              var maxIndex = -1
              var paramValues = new HashMap<Integer, Object>()
              var propertyValueParams = new HashSet<String>()
              var componentType = paramType.ComponentType
              maxIndex = Math.max(maxIndex, processArrayParam(reqParams, paramName, paramType, paramValues, maxIndex))
              maxIndex = Math.max(maxIndex, processArrayParamProperties(reqParams, paramName, paramType, paramValues, maxIndex))
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
              var paramValue = processNonArrayParam(reqParams, paramName, paramType)
              if(paramValue != null) {
                params[i] = paramValue
              }
              processNonArrayParamProperties(reqParams, paramName, paramType, params, i)
            }
          }

          var paramsMap = new HashMap<String, Object>()
          params.eachWithIndex(\p, i -> {
            paramsMap[actionMethod.Parameters[i].Name] = p
          })

          if(jsonpCallback != null) {
            resp.Writer.write("${jsonpCallback}(")
          }
          executeControllerMethod(actionMethodAndControllerInstance.Second, actionMethod, params, paramsMap, resp.Writer)
          if(jsonpCallback != null) {
            resp.Writer.write(")")
            resp.ContentType = "application/javascript"
          }

        } catch (e : FourOhFourException) {
          handle404(e, req, resp)
        } catch (e : FiveHundredException) {
          handle500(e, req, resp)
        } catch (e : CustomHttpException) {
          e.handleException(req, resp)
        }
      }
    }
  }

  private function showArgs(req : HttpServletRequest) : String {
    var args = req.ParameterMap
    var names = req.ParameterNames.toList()
    var argsStr = new StringBuilder(" with args: {")
    for(name in names index i) {
      if(i != 0) argsStr.append(", ")
      argsStr.append(name).append(" -> ")
      var values = args[name]
      if(values.Count == 0) {
        // do nothing
      } else if(values.Count == 1) {
        argsStr.append(values.first())
      } else {
        argsStr.append("[").append(values.join(",")).append("]")
      }
        
    }
    return argsStr.append("}").toString()
  }

  private function getActionMethodAndControllerInstance(path : String) : Pair<IMethodInfo, RoninController> {
    var value = \ -> {
      var actionMethod = Ronin.Config.URLHandler.getControllerMethod(path.split("/"))
      var controllerType = actionMethod.OwnersType
      var controllerCtor = \ -> {
        var ctor = controllerType.TypeInfo.getConstructor({})
        if(ctor == null) {
          throw new FiveHundredException("No default (no-argument) constructor found on ${controllerType.Name}")
        }
        return ctor.Constructor.newInstance({}) as RoninController
      }
      var controller : RoninController
      if(Ronin.Mode == DEVELOPMENT) {
        controller = controllerCtor()
      } else {
        controller = Ronin.cache(controllerCtor, "__ronin__${controllerType.Name}", APPLICATION)
      }
      return Pair.make(actionMethod, controller)
    }
    if(Ronin.Mode == DEVELOPMENT) {
      return value()
    } else {
      return Ronin.cache(value, "__ronin__${path}", APPLICATION)
    }
  }
  
  private function processNonArrayParam(reqParams : ParameterAccess, paramName : String, paramType : Type) : Object {
    var paramValue = reqParams.getParameterValue(paramName, paramType)
    if(paramValue != null or boolean.isAssignableFrom(paramType)) {
      if (paramValue typeis String) {
        try {
          return Ronin.Config.ParamConverter.convertValue(paramType, paramValue)
        } catch (e : IncompatibleTypeException) {
          throw new FiveHundredException("Could not coerce value ${paramValue} of parameter ${paramName} to type ${paramType.Name}", e)
        }
      } else {
        return paramValue
      }
    } else {
      if(paramType.Primitive) {
        throw new FiveHundredException("Missing required (primitive) parameter ${paramName}.")
      }
    }
    return null
  }
  
  private function processNonArrayParamProperties(reqParams : ParameterAccess, paramName : String, paramType : Type, params : Object[], i : int) {
    for(prop in reqParams.getParameterProperties(paramName)) {
      var propertyName = prop.First
      var paramValue = prop.Second
      var propertyInfo = paramType.TypeInfo.getProperty(propertyName)
      if(propertyInfo != null) {
        if(not propertyInfo.hasAnnotation(Restricted) and not Ronin.Config.RestrictedProperties?.contains(propertyInfo)) {
          var propertyType = propertyInfo.FeatureType
          var propertyValue : Object
          try {
            propertyValue = Ronin.Config.ParamConverter.convertValue(propertyType, paramValue)
          } catch (e : IncompatibleTypeException) {
            throw new FiveHundredException("Could not coerce value ${paramValue} of parameter ${paramName} to type ${propertyType.Name}", e)
          }
          if(params[i] == null) {
            params[i] = constructDefault(paramType)
          }
          propertyInfo.Accessor.setValue(params[i], propertyValue)
        }
      } else {
        throw new FiveHundredException("Could not find property ${propertyName} on type ${paramType.Name}")
      }
    }
  }
  
  private function processArrayParam(reqParams : ParameterAccess, paramName : String, paramType : Type, paramValues : Map<Integer, Object>, maxIndex : int) : int {
    var componentType = paramType.ComponentType
    for(prop in reqParams.getArrayParameterValues(paramName, componentType)) {
      var index = prop.First
      maxIndex = Math.max(maxIndex, index)
      var paramValue = prop.Second
      if (paramValue typeis String) {
        try {
          paramValues.put(index, Ronin.Config.ParamConverter.convertValue(componentType, paramValue))
        } catch (e : IncompatibleTypeException) {
          throw new FiveHundredException("Could not coerce value ${paramValue} of parameter ${paramName} to type ${componentType.Name}", e)
        }
      } else {
        paramValues.put(index, paramValue)
      }
    }
    return maxIndex
  }
  
  private function processArrayParamProperties(reqParams : ParameterAccess, paramName : String, paramType : Type, paramValues : Map<Integer, Object>, maxIndex : int) : int {
    var componentType = paramType.ComponentType
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
        if(not propertyInfo.hasAnnotation(Restricted) and not Ronin.Config.RestrictedProperties?.contains(propertyInfo)) {
          var propertyType = propertyInfo.FeatureType
          var propertyValue : Object
          try {
            propertyValue = Ronin.Config.ParamConverter.convertValue(propertyType, propertyParamValue)
          } catch (e : IncompatibleTypeException) {
            throw new FiveHundredException("Could not coerce value ${propertyParamValue} of parameter ${paramName}[${index}].${propertyName} to type ${propertyType.Name}", e)
          }
          propertyInfo.Accessor.setValue(paramValue, propertyValue)
        }
      } else {
        throw new FiveHundredException("Could not find property ${propertyName} on type ${componentType.Name}")
      }
    }
    return maxIndex
  }
  
  private function executeControllerMethod(controller : RoninController, actionMethod : IMethodInfo, params : Object[], paramsMap : HashMap<String, Object>, writer : PrintWriter) {
    try {
      var beforeRequest = true
      using(Ronin.CurrentTrace?.withMessage(actionMethod.OwnersType.Name + ".beforeRequest()")) {
        beforeRequest = controller.beforeRequest(paramsMap)
      }
      if(beforeRequest) {
        using(Ronin.CurrentTrace?.withMessage(actionMethod.OwnersType.Name + "." + actionMethod.DisplayName)) {
          var rtn = actionMethod.CallHandler.handleCall(controller, params)
          Ronin.Config.ReturnValueHandler?.handleReturnValue(rtn, writer)
        }
        using(Ronin.CurrentTrace?.withMessage(actionMethod.OwnersType.Name + ".afterRequest()")) {
          controller.afterRequest(paramsMap)
        }
      }
    } catch (e : CustomHttpException) {
      throw e // bubble this exception on up the stack
    } catch (e : Exception) {
      //TODO cgross - the logger jacks the errant gosu class message up horribly.
      //TODO cgross - is there a way around that?
      var cause = GosuExceptionUtil.findExceptionCause(e)
      if(e typeis ErrantGosuClassException) {
        print("Invalid Gosu class was found : \n\n" + e.GsClass.ParseResultsException.Feedback + "\n\n")
        throw new FiveHundredException("ERROR - Evaluation of method ${actionMethod.Name} on controller ${typeof controller} failed because " + e.GsClass.Name + " is invalid.")
      } else if(cause typeis TemplateParseException) {
        print("Invalid Gosu template was found : \n\n" + cause.Message + "\n\n")
        throw new FiveHundredException("ERROR - Evaluation of method ${actionMethod.Name} on controller ${typeof controller} failed.")
      } else if(cause typeis ParseResultsException) {
        print("Gosu parse exception : \n\n" + cause.Feedback + "\n\n")
        throw new FiveHundredException("ERROR - Evaluation of method ${actionMethod.Name} on controller ${typeof controller} failed.")
      } else {
        Ronin.log(:msg="Evaluation of method ${actionMethod.Name} on controller ${typeof controller} failed.",
                  :level=LogLevel.ERROR,
                  :exception=e )
        throw new FiveHundredException("ERROR - Evaluation of method ${actionMethod.Name} on controller ${typeof controller} failed.", e)
      }
    }
  }

  private function checkMethodPermitted(method : IMethodInfo, httpMethod : HttpMethod) {
    var methodsAnnotation = method.getAnnotation(Methods)?.Instance as Methods
    if(methodsAnnotation != null and not methodsAnnotation.PermittedMethods?.contains(httpMethod)) {
      throw new FiveHundredException("${httpMethod} not permitted on ${method}.")
    }
  }

  private function checkHttps(method : IMethodInfo, scheme : String) {
    var httpsMethodAnnotation = method.getAnnotation(HttpsOnly)?.Instance
    if(httpsMethodAnnotation != null and scheme != "https") {
      throw new FiveHundredException("${method} requires HTTPS protocol.")
    }
    var httpsTypeAnnotation = method.OwnersType.TypeInfo.getAnnotation(HttpsOnly)?.Instance
    if(httpsTypeAnnotation != null and scheme != "https") {
      throw new FiveHundredException("${method} requires HTTPS protocol.")
    }
  }

  private function checkLogin(method : IMethodInfo, requestURL : String) : boolean {
    if(Ronin.Config.LoginRedirect == null) {
      return true
    }
    var noAuthMethodAnnotation = method.getAnnotation(NoAuth)?.Instance
    if(noAuthMethodAnnotation != null) {
      return true
    }
    var noAuthTypeAnnotation = method.OwnersType.TypeInfo.getAnnotation(NoAuth)?.Instance
    if(noAuthTypeAnnotation != null) {
      return true
    }
    if(Ronin.Config.AuthManager?.CurrentUser != null or Ronin.Config.AuthManager?.CurrentUserName != null) {
      IRoninUtils.PostLoginRedirect = null
      return true
    }
    RoninController.redirect(Ronin.Config.LoginRedirect)
    IRoninUtils.PostLoginRedirect = requestURL
    return false
  }

  private function getJsonpCallback(method : IMethodInfo, params : ParameterAccess) : String {
    var jsonpAnnotation = method.getAnnotation(JSONP)?.Instance as JSONP
    if(jsonpAnnotation != null) {
      return params.getParameterValue(jsonpAnnotation.Callback, String) as String
    } else {
      return null
    }
  }

  private function handle404(e : FourOhFourException, req : HttpServletRequest, resp : HttpServletResponse) {
    Ronin.ErrorHandler.on404(e, req, resp)
  }

  private function handle500(e: FiveHundredException, req: HttpServletRequest, resp: HttpServletResponse) {
    Ronin.ErrorHandler.on500(e, req, resp)
  }

  override property get Filter(): javax.servlet.Filter {
    return _roninFilter
  }

  private class ParameterAccess {

    var _req : HttpServletRequest
    var _json : boolean
    var _jsonObj : Map<Object, Object>

    construct(req : HttpServletRequest) {
      _req = req
      if(_req.ContentType?.split(";")?[0] == "text/json" || _req.ContentType?.split(";")?[0] == "application/json") {
        _json = true
        var body = new StringBuilder()
        var reader = _req.Reader
        var line = reader.readLine()
        while(line != null) {
          body.append(line).append("\n")
          line = reader.readLine()
        }
        var obj = JSchemaUtils.parseJson(body.toString())
        if(obj typeis Map<Object, Object>) {
          _jsonObj = obj
        } else {
          throw new FiveHundredException("JSON did not parse as an object: ${obj}")
        }
      } else {
        _json = false
      }
    }

    function getParameterValue(name : String, expectedType : Type) : Object {
      if(_json) {
        var value = _jsonObj[name]
        if(value typeis Map<Object, Object>) {
          return constructJsonObject(value, expectedType)
        } else {
          return value as String
        }
      } else {
        return decode(_req.getParameter(name))
      }
    }

    function getParameterProperties(name : String) : List<Pair<String, String>> {
      var rtn = new ArrayList<Pair<String, String>>()
      if(!_json) {
        var parameterNames = _req.getParameterNames()
        while(parameterNames.hasMoreElements()) {
          var reqParamName = parameterNames.nextElement().toString()
          if(reqParamName.startsWith(name + ".")) {
            var propertyName = reqParamName.substring((name + ".").length)
            rtn.add(Pair.make(propertyName, decode(_req.getParameter(reqParamName))))
          }
        }
      }
      return rtn
    }

    function getArrayParameterValues(name : String, expectedType : Type) : List<Pair<Integer, Object>> {
      var rtn = new ArrayList<Pair<Integer, Object>>()
      if(_json) {
        var value = _jsonObj[name]
        if(value typeis List<Object>) {
          value.eachWithIndex(\v, i -> {
            if(v typeis Map<Object, Object>) {
              rtn.add(Pair.make(i, constructJsonObject(v, expectedType)))
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
          if(reqParamName.startsWith(name) and reqParamName[name.length] == "[") {
            if(reqParamName.lastIndexOf("]") == reqParamName.length - 1) {
              var index : int
              try {
                index = Integer.decode(reqParamName.substring(name.length + 1, reqParamName.length - 1))
              } catch (e : NumberFormatException) {
                throw new FiveHundredException("Malformed indexed parameter ${reqParamName}", e)
              }
              rtn.add(Pair.make(index, decode(_req.getParameter(reqParamName))))
            }
          }
        }
      }
      return rtn
    }

    function getArrayPropertyParameterValues(name : String) : List<Pair<Integer, Pair<String, String>>> {
      var rtn = new ArrayList<Pair<Integer, Pair<String, String>>>()
      if(!_json) {
        var parameterNames = _req.ParameterNames
        while(parameterNames.hasMoreElements()) {
          var reqParamName = parameterNames.nextElement().toString()
          if(reqParamName.startsWith(name) and reqParamName[name.length] == "[") {
            var index : int
            try {
              index = Integer.decode(reqParamName.substring(name.length + 1, reqParamName.lastIndexOf("]")))
            } catch (e : NumberFormatException) {
              throw new FiveHundredException("Malformed indexed parameter ${reqParamName}", e)
            }
            if(reqParamName.lastIndexOf("]") != reqParamName.length - 1 and reqParamName[reqParamName.lastIndexOf("]") + 1] == ".") {
              var propertyName = reqParamName.substring(reqParamName.lastIndexOf("]") + 2)
              var propertyValue = decode(_req.getParameter(reqParamName))
              rtn.add(Pair.make(index, Pair.make(propertyName, propertyValue)))
            }
          }
        }
      }
      return rtn
    }
  }

  private function decode(str : String) : String {
    return str == null ? null : URLDecoder.decode(str, "UTF-8")
  }

  private function constructJsonObject(value : Map<Object, Object>, expectedType : Type) : Object {
    if (value.containsKey("fromID")) {
      return Ronin.Config.ParamConverter.convertValue(expectedType, value["fromID"] as String)
    } else {
      var obj = constructDefault(expectedType)
      value.eachKeyAndValue(\k, v -> {
        var propertyInfo = expectedType.TypeInfo.getProperty(k as String)
        if(propertyInfo != null) {
          if(not propertyInfo.hasAnnotation(Restricted) and not Ronin.Config.RestrictedProperties?.contains(propertyInfo)) {
            var propertyType = propertyInfo.FeatureType
            var propertyValue : Object
            try {
              if (v typeis Map<Object, Object>) {
                propertyValue = constructJsonObject(v, propertyType)
              } else {
                propertyValue = Ronin.Config.ParamConverter.convertValue(propertyType, v as String)
              }
            } catch (e : IncompatibleTypeException) {
              throw new FiveHundredException("Could not coerce value ${v} of parameter ${k} to type ${propertyType.Name}", e)
            }
            propertyInfo.Accessor.setValue(obj, propertyValue)
          }
        } else {
          throw new FiveHundredException("Could not find property ${k} on type ${expectedType.Name}")
        }
      })
      return obj
    }
  }

  private function constructDefault(paramType : Type) : Object {
    var constructor = paramType.TypeInfo.getConstructor({})
    if(constructor != null) {
      return constructor.Constructor.newInstance({})
    } else {
      throw new FiveHundredException("Could not construct object of type ${paramType} implied by property parameters, because no no-arg constructor is defined.")
    }
  }

}