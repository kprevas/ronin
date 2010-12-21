package controller

uses java.util.Date

class SimplePassThru extends ronin.RoninController {

    function noArgs() {
        view.NoArgView.render(Writer)
    }
    
    function oneStringArg(x : String) {
        view.OneStringArg.render(Writer, x)
    }
    
    function oneBooleanArg(x : boolean) {
        view.OneBooleanArg.render(Writer, x)
    }
    
    function oneIntegerArg(x : int) {
        view.OneIntegerArg.render(Writer, x)
    }
    
    function oneFloatArg(x : float) {
        view.OneFloatArg.render(Writer, x)
    }
    
    function oneDateArg(x : Date) {
        view.OneDateArg.render(Writer, x)
    }
    
    function oneStringArrayArg(x : String[]) {
        view.OneStringArrayArg.render(Writer, x)
    }
    
    function oneDateArrayArg(x : Date[]) {
        view.OneDateArrayArg.render(Writer, x)
    }
    
    function multipleArgs(a : String, b : boolean, c : int, d : float, e : Date) {
        view.MultipleArgs.render(Writer, a, b, c, d, e)
    }
    
    function stringProperty(x : Inner) {
        view.OneStringArg.render(Writer, x.propA)
    }
    
    function booleanProperty(x : Inner) {
        view.OneBooleanArg.render(Writer, x.propB)
    }
    
    function intProperty(x : Inner) {
        view.OneIntegerArg.render(Writer, x.propC)
    }
    
    function floatProperty(x : Inner) {
        view.OneFloatArg.render(Writer, x.propD)
    }
    
    function dateProperty(x : Inner) {
        view.OneDateArg.render(Writer, x.propE)
    }
    
    function stringPropertyFromArrayIndexZero(x : Inner[]) {
        view.OneStringArg.render(Writer, x[0].propA)
    }
    
    function booleanPropertyFromArrayIndexZero(x : Inner[]) {
        view.OneBooleanArg.render(Writer, x[0].propB)
    }
    
    function intPropertyFromArrayIndexZero(x : Inner[]) {
        view.OneIntegerArg.render(Writer, x[0].propC)
    }
    
    function floatPropertyFromArrayIndexZero(x : Inner[]) {
        view.OneFloatArg.render(Writer, x[0].propD)
    }
    
    function datePropertyFromArrayIndexZero(x : Inner[]) {
        view.OneDateArg.render(Writer, x[0].propE)
    }
    
    function stringPropertyFromArrayIndexOne(x : Inner[]) {
        view.OneStringArg.render(Writer, x[1].propA)
    }
    
    function booleanPropertyFromArrayIndexOne(x : Inner[]) {
        view.OneBooleanArg.render(Writer, x[1].propB)
    }
    
    function intPropertyFromArrayIndexOne(x : Inner[]) {
        view.OneIntegerArg.render(Writer, x[1].propC)
    }
    
    function floatPropertyFromArrayIndexOne(x : Inner[]) {
        view.OneFloatArg.render(Writer, x[1].propD)
    }
    
    function datePropertyFromArrayIndexOne(x : Inner[]) {
        view.OneDateArg.render(Writer, x[1].propE)
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