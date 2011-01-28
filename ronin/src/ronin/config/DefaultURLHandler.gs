package ronin.config

uses ronin.*
uses java.net.*
uses gw.lang.reflect.*

/**
 *  Default implementation of {@link ronin.config.IURLHandler}.  Looks up a type in the "controller"
 *  package whose name matches the first path component of the request URL, and returns the method
 *  on that type whose name matches the second path component.  Falls back to the default controller/action
 *  if one or both path components are missing.
 */
class DefaultURLHandler implements IURLHandler {

  override function getControllerMethod(request : String[]) : IMethodInfo {
    var controllerType = getControllerType(request)
    var action = getActionName(request)
    var actionMethod : IMethodInfo = null
    if(Ronin.Mode != PRODUCTION) {
      actionMethod = controllerType.TypeInfo.Methods.singleWhere(\ method -> method.Public and method.DisplayName == action)
    } else {
      actionMethod = controllerType.TypeInfo.Methods.firstWhere(\ method -> method.Public and method.DisplayName == action)
    }
    if(actionMethod == null) {
      throw new FourOhFourException("Action ${action} not found.")
    }
    return actionMethod
  }

  /**
   *  Gets the type "controller.[type name]" where the type name is the first path element, or returns the default
   *  controller type if the path has no elements.
   */
  protected function getControllerType(request : String[]) : Type {
    var controllerType : Type
    if(request.length < 1 || !request[0]?.HasContent) {
      if(Ronin.DefaultController == null) {
        throw new MalformedURLException()
      } else {
        controllerType = Ronin.DefaultController
      }
    } else {
      var controller = request[0]
      controllerType = TypeSystem.getByFullNameIfValid("controller.${controller}")
      if(controllerType == null) {
        throw new FourOhFourException("Controller ${controller} not found.")
      } else if(not RoninController.Type.isAssignableFrom(controllerType)) {
        throw new FourOhFourException("Controller ${controller} is not a valid controller.")
      }
    }
    return controllerType
  }

  /**
   *  Returns the second path element, or the default action if the path has fewer than two elements.
   */
  protected function getActionName(request : String[]) : String {
    if(request.length < 2) {
      return Ronin.DefaultAction
    } else {
      return request[1]
    }
  }

}