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
    
    function stringProperty(x : ParamObj) {
        view.OneStringArg.render(Writer, x.propA)
    }
    
    function booleanProperty(x : ParamObj) {
        view.OneBooleanArg.render(Writer, x.propB)
    }
    
    function intProperty(x : ParamObj) {
        view.OneIntegerArg.render(Writer, x.propC)
    }
    
    function floatProperty(x : ParamObj) {
        view.OneFloatArg.render(Writer, x.propD)
    }
    
    function dateProperty(x : ParamObj) {
        view.OneDateArg.render(Writer, x.propE)
    }
    
    function stringPropertyFromArrayIndexZero(x : ParamObj[]) {
        view.OneStringArg.render(Writer, x[0].propA)
    }
    
    function booleanPropertyFromArrayIndexZero(x : ParamObj[]) {
        view.OneBooleanArg.render(Writer, x[0].propB)
    }
    
    function intPropertyFromArrayIndexZero(x : ParamObj[]) {
        view.OneIntegerArg.render(Writer, x[0].propC)
    }
    
    function floatPropertyFromArrayIndexZero(x : ParamObj[]) {
        view.OneFloatArg.render(Writer, x[0].propD)
    }
    
    function datePropertyFromArrayIndexZero(x : ParamObj[]) {
        view.OneDateArg.render(Writer, x[0].propE)
    }
    
    function stringPropertyFromArrayIndexOne(x : ParamObj[]) {
        view.OneStringArg.render(Writer, x[1].propA)
    }
    
    function booleanPropertyFromArrayIndexOne(x : ParamObj[]) {
        view.OneBooleanArg.render(Writer, x[1].propB)
    }
    
    function intPropertyFromArrayIndexOne(x : ParamObj[]) {
        view.OneIntegerArg.render(Writer, x[1].propC)
    }
    
    function floatPropertyFromArrayIndexOne(x : ParamObj[]) {
        view.OneFloatArg.render(Writer, x[1].propD)
    }
    
    function datePropertyFromArrayIndexOne(x : ParamObj[]) {
        view.OneDateArg.render(Writer, x[1].propE)
    }

}