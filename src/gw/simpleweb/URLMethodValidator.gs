package gw.simpleweb

uses gw.lang.reflect.IType
uses gw.lang.reflect.IMethodInfo
uses gw.lang.parser.*
uses gw.lang.parser.expressions.*
uses gw.lang.parser.resources.Res

class URLMethodValidator implements gw.lang.reflect.IMethodCallValidator, gw.lang.IAnnotation {

    override function validate( pe : IParsedElement ) {
      var args : IExpression[]
      if(pe typeis IBeanMethodCallExpression) {
        args = (pe as IBeanMethodCallExpression).Args
      } else if(pe typeis IMethodCallExpression) {
        args = (pe as IMethodCallExpression).Args
      }
      if( args != null && args.length == 1 )
      {
        if( (args[0] typeis IBlockExpression) )
        {
          var blockExp = args[0] as IBlockExpression
          var methodCall = blockExp.Body
          var methodOwner : IType
          var methodInfo : IMethodInfo
          if(methodCall typeis IBeanMethodCallExpression) {
            methodInfo = (methodCall as IBeanMethodCallExpression).MethodDescriptor
            methodOwner = (methodCall as IBeanMethodCallExpression).RootType
          } else if(methodCall typeis IMethodCallExpression) {
            methodInfo = (methodCall as IMethodCallExpression).FunctionType.MethodInfo
            methodOwner = (methodCall as IMethodCallExpression).FunctionType.MethodInfo.OwnersType
          } else {
            pe.addParseException( Res.MSG_ANY, {"Block body must be a single method call to an action method."})
            return
          }
          if(methodInfo.Static) {
              if(not SimpleWebController.isAssignableFrom((methodOwner as IMetaType).Type)) {
                pe.addParseException( Res.MSG_ANY, {"Method called from block body must be on a class extending gw.simpleweb.SimpleWebController."} )
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