classpath ".,../src,../lib"

uses gw.lang.reflect.TypeSystem
    
for(typename in TypeSystem.getAllTypeNames()) {
    if(typename.toString().startsWith("gw.simpleweb") or typename.toString().startsWith("view.")) {
        var type = TypeSystem.getByFullName( typename )
        if(!type.Valid) {
            print("${typename} is invalid")
            if(type typeis gw.lang.reflect.gs.IGScriptClass) {
                print(type.ParseResultsException)
            }
        } else {
            print("${typename} is valid")
        }
    }
}