package ronin.config

/**
 *  Represents an object responsible for converting parameters from strings in the HTTP request to the types expected
 *  by the target controller method.  It is recommended that you subclass {@link ronin.config.DefaultParamConverter}
 *  instead of implementing this directly.
 */
interface IParamConverter {

  /**
   *  Converts a parameter from the String received via the request to the given type.
   *  @param paramType The type expected by the target controller method.
   *  @param paramValue The value of the parameter in the request.
   *  @return The converted value.
   */
  function convertValue(paramType : Type, paramValue : String) : Object

}