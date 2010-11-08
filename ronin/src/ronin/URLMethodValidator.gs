package ronin

uses gw.lang.reflect.*
uses gw.lang.parser.*
uses gw.lang.parser.expressions.*
uses gw.lang.parser.resources.Res
uses gw.lang.reflect.gs.IGosuMethodInfo
uses java.lang.CharSequence
uses gw.lang.reflect.java.IJavaMethodInfo

uses gw.internal.gosu.parser.*
uses gw.internal.gosu.parser.expressions.*

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
        if( args != null && args.length == 1 )
        {
          if(args[0] typeis IBlockExpression)
          {
            var blockExp = args[0] as IBlockExpression
            var methodCall = blockExp.Body
            var methodOwner : IType
            var methodInfo : IMethodInfo
            var methodArgs : IExpression[]
            if(methodCall typeis IBeanMethodCallExpression) {
              methodInfo = methodCall.MethodDescriptor
              methodOwner = methodCall.RootType
              methodArgs = methodCall.Args
            } else if(methodCall typeis IMethodCallExpression) {
              methodInfo = methodCall.FunctionType.MethodInfo
              methodOwner = methodCall.FunctionType.MethodInfo.OwnersType
              methodArgs = methodCall.Args
            } else {
              pe.addParseException( Res.MSG_ANY, {"Block body must be a single method call to an action method."})
              return
            }
            if(methodOwner typeis IMetaType) {
              methodOwner = methodOwner.Type
            }
            var getMethodArgs = {createStringLiteral(methodInfo.DisplayName),
              createBeanMethodCallExpression(createListLiteral(methodInfo.Parameters.map(\i -> createTypeLiteral(i.FeatureType)).toList(), IType), List<IType>.Type.TypeInfo.getMethod("toTypedArray", {}) as IGosuMethodInfo, {})}
            var mi = createBeanMethodCallExpression(createPropertyAccessExpression(createTypeLiteral(methodOwner), IType.Type.TypeInfo.getProperty("TypeInfo")),
              ((typeof methodOwner.TypeInfo) as ITypeRef).TypeInfo.getMethod("getMethod", {CharSequence, IType[]}) as IJavaMethodInfo, 
              getMethodArgs)
            var newArgs : List<IExpression> = {mi}
            if(methodArgs != null) {
              newArgs.addAll(methodArgs.toList())
            }
            var argList = createListLiteral(newArgs, Object)
            var argBlock = createBeanMethodCallExpression(createTypeLiteral(URLUtil), URLUtil.Type.TypeInfo.getMethod("makeURLBlock", {List<Object>}) as IGosuMethodInfo, {argList})
            args[0] = argBlock
            if(argTypes != null) {
              argTypes[0] = typeof argBlock
            }
            for(arg in methodArgs) {
              replaceCapturedSymbols(arg)
            }
            if(methodInfo.Static) {
                if(not RoninController.Type.isAssignableFrom(methodOwner) and not
                  (methodOwner typeis IMetaType and RoninController.Type.isAssignableFrom(methodOwner.Type))) {
                  pe.addParseException( Res.MSG_ANY, {"Method called from block body must be on a class extending ronin.RoninController."} )
                }
            } else {
              pe.addParseException( Res.MSG_ANY, {"Method called from block body must be static."} )
            }
          } else {
              pe.addParseException( Res.MSG_ANY, {"Must pass a single argument that is a block expression with no arguments"} )
          }
        } else {
          pe.addParseException( Res.MSG_ANY, {"Must pass a single argument that is a block expression with no arguments"} )
        }
      }
    }
    
    private static function replaceCapturedSymbols(elt : IParsedElement) {
      if(elt typeis IIdentifierExpression) {
        var symbol = elt.Symbol
        if(symbol typeis ICapturedSymbol) {
          elt.setSymbol(symbol.ReferredSymbol, symbol.ReferredSymbol.DynamicSymbolTable)
        }
      }
      for(child in elt.Location.Children) {
        replaceCapturedSymbols(child.ParsedElement)
      }
    }

    private static function createStringLiteral(value : String) : StringLiteral {
      return new StringLiteral(value)
    }

    private static function createTypeLiteral(type : Type) : TypeLiteral {
      return new TypeLiteral(type)
    }

    private static function createListLiteral(expressions : List<IExpression>, listType : Type) : InferredNewExpression {
      var e = new InferredNewExpression()
      var type = java.util.ArrayList.getParameterizedType({listType})
      var lie = new CollectionInitializerExpression();
      for(exp in expressions) {
        lie.add(exp as Expression)
      }
      e.setInitializer(lie)
      e.setType(type)
      e.setConstructor(type.TypeInfo.getCallableConstructor({}))
      return e
    }

    private static function createBeanMethodCallExpression(root : IExpression, method : IGosuMethodInfo, args : List<IExpression>) : BeanMethodCallExpression {
      var e = new BeanMethodCallExpression()
      e.setRootExpression(root as Expression)
      e.setArgs(args.toArray(new Expression[args.size()]))
      e.setMethodDescriptor(method)
      e.setFunctionType(method.getDfs().getType() as IFunctionType)
      e.setAccessPath(method.getDisplayName())
      e.setType(method.getReturnType())
      return e
    }

    private static function createBeanMethodCallExpression(root : IExpression, method : IJavaMethodInfo, args : List<IExpression>) : BeanMethodCallExpression {
      var e = new BeanMethodCallExpression()
      e.setRootExpression(root as Expression)
      e.setArgs(args.toArray(new Expression[args.size()]))
      e.setMethodDescriptor(method)
      e.setFunctionType(new FunctionType(method))
      e.setAccessPath(method.getDisplayName())
      e.setType(method.getReturnType())
      return e
    }

    private static function createPropertyAccessExpression(root : IExpression, prop : IPropertyInfo) : IExpression {
      var memberAccess = new MemberAccess()
      memberAccess.setRootExpression(root as Expression)
      memberAccess.setMemberName(prop.getName())
      memberAccess.setType(prop.getFeatureType())
      return memberAccess
    }
}