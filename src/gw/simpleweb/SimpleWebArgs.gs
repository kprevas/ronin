package gw.simpleweb

uses gw.lang.cli.*

class SimpleWebArgs {

  static var _devMode : boolean as DevMode

  @DefaultValue( "80" )
  static var _port : int as Port

}