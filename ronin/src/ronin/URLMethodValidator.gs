package ronin

uses gw.lang.reflect.*
uses gw.lang.parser.*
uses gw.lang.parser.expressions.*
uses gw.lang.parser.resources.Res

/**
 *  Compile-time validator for methods which take references to controller methods as arguments.
 */
class URLMethodValidator implements gw.lang.reflect.IMethodCallValidator, gw.lang.IAnnotation {

    override function validate(pe : IParsedElement, editor : boolean) {
      if(not editor) {
        var args : IExpression[]
        var argTypes : IType[] = null
        if(pe typeis IBeanMethodCallExpression) {
          args = pe.Args
          argTypes = pe.ArgTypes
        } else if(pe typeis IMethodCallExpression) {
          args = pe.Args
        }
        if(args != null && args.length == 1) {
          var arg = args[0]
          if(arg typeis IFeatureLiteralExpression) {
            if(not RoninController.Type.isAssignableFrom(arg.RootType)) {
              pe.addParseException(Res.MSG_ANY, {"Method must be on a class extending ronin.RoninController."})
            }
            if(arg.ParameterTypes?.HasElements and not arg.BoundArgs?.HasElements) {
              pe.addParseException(Res.MSG_ANY, {"Method arguments must be bound to actual values."})
            }
          } else {
            pe.addParseException(Res.MSG_ANY, {"Must pass a single feature literal"})
          }
        } else {
          pe.addParseException(Res.MSG_ANY, {"Must pass a single feature literal"})
        }
      }
    }

}