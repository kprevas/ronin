classpath "."

uses gw.lang.reflect.TypeSystem
    
for(typename in TypeSystem.getAllTypeNames()) {
    if(typename.toString().startsWith("ronindb.test")) {
        var type = TypeSystem.getByFullName( typename as String )
        if(!type.Valid) {
            print("${typename} is invalid")
            if(type typeis gw.lang.reflect.gs.IGosuClass) {
                print(type.ParseResultsException)
            }
        } else {
            print("${typename} is valid")
        }
    }
}
