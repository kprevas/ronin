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

  function toJSON( include : List<IPropertyReference> = null,
                   exclude : List<IPropertyReference> = null ) : String {
    return JSchemaUtils.serializeJson(toJSONObject(include, exclude))
  }
  
  function toJSONObject( include : List<IPropertyReference> = null,
                         exclude : List<IPropertyReference> = null,
                         alreadyHandled : IdentityHashMap<Object, Object> = null ) : Object {
    if(alreadyHandled == null) {
      alreadyHandled = {}
    }
    if ( this typeis List ) {
      if(alreadyHandled.containsKey(this)) {
        return Collections.EMPTY_LIST
      } else {
        alreadyHandled.put(this, null)
        return this.map( \ elt -> elt.toJSONObject(include, exclude, alreadyHandled) )        
      }
    } if ( this typeis Object[] ) {
      if(alreadyHandled.containsKey(this)) {
        return Collections.EMPTY_LIST
      } else {
        alreadyHandled.put(this, null)
        return this.toList().toJSONObject(include, exclude, alreadyHandled)
      }
    } else if ( this typeis Map ) {
      if(alreadyHandled.containsKey(this)) {
        return Collections.EMPTY_MAP
      } else {
        alreadyHandled.put(this, null)
        var returnMap = new LinkedHashMap()
        this.eachKeyAndValue( \ k, val -> { returnMap[k.toString()] = val.toJSONObject(include, exclude, alreadyHandled ) } )
        return returnMap
      }
    } else if(this.Class.Name.startsWith("java")) {
      return this
    } else if(this typeis IType) {
      return this.Name
    } else if(this typeis Class) {
      return this.Name
    } else {
      var recurse = not alreadyHandled.containsKey(this)
      alreadyHandled.put(this, null)
      var map = new LinkedHashMap()
      for(prop in (typeof this).TypeInfo.Properties.where(\p -> p.Readable and p.Public and not p.Static).orderBy( \ elt -> elt.Name )) {
        if(exclude?.hasMatch( \ pr -> pr.PropertyInfo == prop )) {
          continue
        }
        if(include != null and not include.hasMatch( \ pr -> pr.PropertyInfo == prop )) {
          continue
        }
        var val = prop.Accessor.getValue(this)
        if(not recurse and (val typeis List or val typeis Object[] or val typeis Map or not val.Class.Name.startsWith("java"))) {
          continue
        }
        map.put(prop.Name, val?.toJSONObject(include, exclude, alreadyHandled))
      }
      return map
    }
  }

}
