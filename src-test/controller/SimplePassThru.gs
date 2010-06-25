package controller

uses java.util.Date

class SimplePassThru extends ronin.SimpleWebController {

    static function noArgs() {
        view.NoArgView.render(writer)
    }
    
    static function oneStringArg(x : String) {
        view.OneStringArg.render(writer, x)
    }
    
    static function oneBooleanArg(x : boolean) {
        view.OneBooleanArg.render(writer, x)
    }
    
    static function oneIntegerArg(x : int) {
        view.OneIntegerArg.render(writer, x)
    }
    
    static function oneFloatArg(x : float) {
        view.OneFloatArg.render(writer, x)
    }
    
    static function oneDateArg(x : Date) {
        view.OneDateArg.render(writer, x)
    }
    
    static function oneStringArrayArg(x : String[]) {
        view.OneStringArrayArg.render(writer, x)
    }
    
    static function oneDateArrayArg(x : Date[]) {
        view.OneDateArrayArg.render(writer, x)
    }
    
    static function multipleArgs(a : String, b : boolean, c : int, d : float, e : Date) {
        view.MultipleArgs.render(writer, a, b, c, d, e)
    }
    
    static function stringProperty(x : Inner) {
        view.OneStringArg.render(writer, x.propA)
    }
    
    static function booleanProperty(x : Inner) {
        view.OneBooleanArg.render(writer, x.propB)
    }
    
    static function intProperty(x : Inner) {
        view.OneIntegerArg.render(writer, x.propC)
    }
    
    static function floatProperty(x : Inner) {
        view.OneFloatArg.render(writer, x.propD)
    }
    
    static function dateProperty(x : Inner) {
        view.OneDateArg.render(writer, x.propE)
    }
    
    static function stringPropertyFromArrayIndexZero(x : Inner[]) {
        view.OneStringArg.render(writer, x[0].propA)
    }
    
    static function booleanPropertyFromArrayIndexZero(x : Inner[]) {
        view.OneBooleanArg.render(writer, x[0].propB)
    }
    
    static function intPropertyFromArrayIndexZero(x : Inner[]) {
        view.OneIntegerArg.render(writer, x[0].propC)
    }
    
    static function floatPropertyFromArrayIndexZero(x : Inner[]) {
        view.OneFloatArg.render(writer, x[0].propD)
    }
    
    static function datePropertyFromArrayIndexZero(x : Inner[]) {
        view.OneDateArg.render(writer, x[0].propE)
    }
    
    static function stringPropertyFromArrayIndexOne(x : Inner[]) {
        view.OneStringArg.render(writer, x[1].propA)
    }
    
    static function booleanPropertyFromArrayIndexOne(x : Inner[]) {
        view.OneBooleanArg.render(writer, x[1].propB)
    }
    
    static function intPropertyFromArrayIndexOne(x : Inner[]) {
        view.OneIntegerArg.render(writer, x[1].propC)
    }
    
    static function floatPropertyFromArrayIndexOne(x : Inner[]) {
        view.OneFloatArg.render(writer, x[1].propD)
    }
    
    static function datePropertyFromArrayIndexOne(x : Inner[]) {
        view.OneDateArg.render(writer, x[1].propE)
    }
    
    static class Inner {
        var _a : String as propA
        var _b : boolean as propB
        var _c : int as propC
        var _d : float as propD
        var _e : Date as propE
        
        static function fromID(key : String) : Inner {
            return new Inner(){:propA = "object ${key}"}
        }
        
        function toID() : String {
            return propA
        }
    }

}