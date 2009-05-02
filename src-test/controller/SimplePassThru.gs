package gw.simplewebtest.controller

uses java.util.Date

class SimplePassThru extends gw.simpleweb.SimpleWebController {

    static function noArgs() {
        gw.simpleweb.view.NoArgView.render(writer)
    }
    
    static function oneStringArg(x : String) {
        gw.simpleweb.view.OneStringArg.render(writer, x)
    }
    
    static function oneBooleanArg(x : boolean) {
        gw.simpleweb.view.OneBooleanArg.render(writer, x)
    }
    
    static function oneIntegerArg(x : int) {
        gw.simpleweb.view.OneIntegerArg.render(writer, x)
    }
    
    static function oneFloatArg(x : float) {
        gw.simpleweb.view.OneFloatArg.render(writer, x)
    }
    
    static function oneDateArg(x : Date) {
        gw.simpleweb.view.OneDateArg.render(writer, x)
    }
    
    static function oneStringArrayArg(x : String[]) {
        gw.simpleweb.view.OneStringArrayArg.render(writer, x)
    }
    
    static function oneStringDateArg(x : Date[]) {
        gw.simpleweb.view.OneStringDateArg.render(writer, x)
    }
    
    static function multipleArgs(a : String, b : boolean, c : int, d : float, e : Date) {
        gw.simpleweb.view.MultipleArgs.render(writer, a, b, c, d, e)
    }
    
    static function stringProperty(x : Inner) {
        gw.simpleweb.view.OneStringArg.render(writer, x.propA)
    }
    
    static function booleanProperty(x : Inner) {
        gw.simpleweb.view.OneBooleanArg.render(writer, x.propB)
    }
    
    static function intProperty(x : Inner) {
        gw.simpleweb.view.OneIntegerArg.render(writer, x.propC)
    }
    
    static function floatProperty(x : Inner) {
        gw.simpleweb.view.OneFloatArg.render(writer, x.propD)
    }
    
    static function dateProperty(x : Inner) {
        gw.simpleweb.view.OneDateArg.render(writer, x.propE)
    }
    
    static function stringPropertyFromArrayIndexZero(x : Inner[]) {
        gw.simpleweb.view.OneStringArg.render(writer, x[0].propA)
    }
    
    static function booleanPropertyFromArrayIndexZero(x : Inner[]) {
        gw.simpleweb.view.OneBooleanArg.render(writer, x[0].propB)
    }
    
    static function intPropertyFromArrayIndexZero(x : Inner[]) {
        gw.simpleweb.view.OneIntegerArg.render(writer, x[0].propC)
    }
    
    static function floatPropertyFromArrayIndexZero(x : Inner[]) {
        gw.simpleweb.view.OneFloatArg.render(writer, x[0].propD)
    }
    
    static function datePropertyFromArrayIndexZero(x : Inner[]) {
        gw.simpleweb.view.OneDateArg.render(writer, x[0].propE)
    }
    
    static function stringPropertyFromArrayIndexOne(x : Inner[]) {
        gw.simpleweb.view.OneStringArg.render(writer, x[1].propA)
    }
    
    static function booleanPropertyFromArrayIndexOne(x : Inner[]) {
        gw.simpleweb.view.OneBooleanArg.render(writer, x[1].propB)
    }
    
    static function intPropertyFromArrayIndexOne(x : Inner[]) {
        gw.simpleweb.view.OneIntegerArg.render(writer, x[1].propC)
    }
    
    static function floatPropertyFromArrayIndexOne(x : Inner[]) {
        gw.simpleweb.view.OneFloatArg.render(writer, x[1].propD)
    }
    
    static function datePropertyFromArrayIndexOne(x : Inner[]) {
        gw.simpleweb.view.OneDateArg.render(writer, x[1].propE)
    }
    
    class Inner {
        var _a : String as propA
        var _b : boolean as propB
        var _c : int as propC
        var _d : float as propD
        var _e : Date as propE
    }

}