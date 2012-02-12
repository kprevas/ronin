package ronin

uses java.util.List
uses java.util.Map
uses java.lang.*
uses gw.lang.reflect.*
uses gw.util.*
uses gw.lang.reflect.gs.*
uses gw.lang.reflect.features.*
uses org.jschema.model.*
uses org.jschema.util.*
uses java.util.Map
uses java.util.Set
uses java.util.Collections
uses java.util.HashMap
uses java.util.LinkedHashMap
uses java.util.IdentityHashMap

enhancement ObjectEnhancement: Object {

  function toJSON( depth = 2,
                   include : List<IPropertyReference> = null,
                   exclude : List<IPropertyReference> = null ) : String {
    return JSchemaUtils.serializeJson(toJSONObject(this, depth, include, exclude))
  }
  
  private static function toJSONObject( val : Object, depth: int,
                                 include: List <IPropertyReference> = null, exclude: List <IPropertyReference> = null ) : Object {
    if ( val typeis List ) {
      return val.map( \ elt -> toJSONObject(elt, depth, include, exclude) )
    } if ( val typeis Object[] ) {
      return toJSONObject(val.toList(), depth, include, exclude)
    } else if ( val typeis Map ) {
      var returnMap = new LinkedHashMap()
      val.eachKeyAndValue( \ k, component -> { returnMap[k.toString()] = toJSONObject(component, depth, include, exclude) } )
      return returnMap
    } else if(val == null) {
      return null
    } else if(val.Class.Name.startsWith("java")) {
      return val
    } else if(val typeis IType) {
      return val.Name
    } else if(val typeis Class) {
      return val.Name
    } else {
      if(depth == 0) {
        return null
      } else {
        var map = new LinkedHashMap()
        for(prop in (typeof val).TypeInfo.Properties.where(\p -> p.Readable and p.Public and not p.Static).orderBy( \ elt -> elt.Name )) {
          if(exclude?.hasMatch( \ pr -> pr.PropertyInfo == prop )) {
            continue
          }
          if(include != null and not include.hasMatch( \ pr -> pr.PropertyInfo == prop )) {
            continue
          }
          var propVal = prop.Accessor.getValue(val)
          var transformed = toJSONObject(propVal, depth-1, include, exclude)
          if(transformed != null) {
            map[prop.Name] = transformed
          }
        }
        return map
      }
    }
  }

}
