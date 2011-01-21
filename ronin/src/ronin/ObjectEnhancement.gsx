package ronin

uses java.lang.*
uses org.stringtree.json.JSONWriter
uses gw.lang.reflect.gs.IGosuObject

enhancement ObjectEnhancement: Object {

  function toJSON() : String {
    var w = new JSONWriter()
    if(this typeis IGosuObject) {
      var s = new StringBuffer("{")
      s.append("\"class\":\"${typeof this}\"")
      var properties = (typeof this).TypeInfo.Properties.where(\p -> p.Readable)
      for(prop in properties index i) {
        s.append("\"${prop.Name}\":${prop.Accessor.getValue(this).toJSON()}")
        if(i < properties.Count - 1) {
          s.append(",")
        }
      }
      s.append("}")
      return s.toString()
    } else {
      return w.write(this)
    }
  }

}