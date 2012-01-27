package ronin

uses java.lang.*
uses gw.lang.reflect.*
uses gw.util.*
uses gw.lang.reflect.gs.*
uses gw.lang.reflect.features.*
uses org.jschema.model.*
uses org.jschema.util.*

enhancement ObjectEnhancement: Object {

  function toJSON( include : List<IPropertyReference> = null,
                   exclude : List<IPropertyReference> = null ) : String {
    var map = new JsonMap()
    for(prop in (typeof this).TypeInfo.Properties.where(\p -> p.Readable and p.Public)) {
      if(include != null) {
        if(include.hasMatch( \ pr -> pr.PropertyInfo == prop )) {
          map.put(prop.Name, prop.Accessor.getValue(this))
        }
      } else if (not exclude?.hasMatch( \ pr -> pr.PropertyInfo == prop )){
        map.put(prop.Name, prop.Accessor.getValue(this))
      }
    }
    return JSchemaUtils.serializeJson(map);
  }

}
