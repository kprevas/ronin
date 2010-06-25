package ronin

uses gw.lang.cli.*

class RoninArgs {

  static var _devMode : boolean as DevMode

  @DefaultValue( "80" )
  static var _port : int as Port

}