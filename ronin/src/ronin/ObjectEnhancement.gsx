package ronin

uses java.lang.*
uses org.stringtree.json.JSONWriter
uses gw.lang.reflect.IRelativeTypeInfo
uses gw.lang.reflect.gs.*

enhancement ObjectEnhancement: Object {

  function toJSON() : String {
    var w = new JSONWriter()
    var typeInfo = (typeof this).TypeInfo
    if(typeInfo typeis IGosuClassTypeInfo) {
      var s = new StringBuffer("{")
      s.append("\"class\":\"class ${typeof this}\"")
      var properties = typeInfo.DeclaredProperties.where(\p -> p.Readable and p.Public)
      for(prop in properties index i) {
        s.append(",")
        s.append("\"${prop.Name}\":${prop.Accessor.getValue(this)?.toJSON()}")
      }
      s.append("}")
      return s.toString()
    } else {
      return w.write(this)
    }
  }

}