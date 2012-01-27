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

enhancement ObjectEnhancement: Object {

  function toJSON( include : List<IPropertyReference> = null,
                   exclude : List<IPropertyReference> = null ) : String {
    
    var o : Object
    if ( this typeis List ) {
      o = new JsonList(this)
    } else if ( this typeis Map ) {
      var map = new JsonMap()
      this.eachKeyAndValue( \ k, v -> {
        map.put(k.toString(), v)
      })
      o = map
    } else {
      var map = new JsonMap()
      for(prop in (typeof this).TypeInfo.Properties.where(\p -> p.Readable and p.Public)) {
        if( (include != null and include.hasMatch( \ pr -> pr.PropertyInfo == prop )) or
            (not exclude?.hasMatch( \ pr -> pr.PropertyInfo == prop ))) {
          map.put(prop.Name, prop.Accessor.getValue(this))
        }
      }
      o = map
    }
    return JSchemaUtils.serializeJson(o);
  }

}
