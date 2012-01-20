package ronin.config

uses java.lang.*
uses java.util.Date
uses gw.config.*
uses gw.lang.reflect.*
uses gw.lang.parser.exceptions.*

/**
 *  Default implementation of {@link ronin.config.IParamConverter}.  Performs the usual conversions
 *  for primitive types and dates, and attempts to find a factory method to which the String can be passed for other types.
 *  Subclasses should probably just override {@link #getFactoryMethod(Type)}.
 */
class DefaultParamConverter implements IParamConverter {

  override function convertValue(paramType : Type, paramValue : String) : Object {
    if (paramType == boolean) {
      return "on".equals(paramValue) or "true".equals(paramValue)
    }
    if(not paramValue?.HasContent) {
      if(not paramType.Primitive) {
        return null
      } else {
        throw new IncompatibleTypeException()
      }
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
      case Date:
        return new Date(paramValue)
      default:
        return CommonServices.getCoercionManager().convertValue(paramValue, paramType)
      }
    }
  }

  /**
   *  Given a type, returns a static method on that type which is expected to take a String and return an instance of
   *  the type in question.  The default implementation expects said method to be named "fromID".
   *  @param type The type which the factory method must return.
   */
  protected function getFactoryMethod(type : Type) : IMethodInfo {
    for(var method in type.TypeInfo.Methods) {
      if(method.Static and method.DisplayName == "fromId" and method.ReturnType.Name == type.Name and method.Parameters.Count == 1) {
        return method
      }
    }
    return null
  }


}