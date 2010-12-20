package ronin

uses ronin.config.*
uses java.util.*
uses java.lang.*

class Trace {
  var _elements = new ArrayList<TraceElement>()
  var _currentDepth : int as Depth

  function addElement( msg : Object ){
    _elements.add( new TraceElement(){ :Depth = _currentDepth, :Msg = msg } )
  }

  function forMessage( msg : Object ) : TraceElementHelper {
    return new TraceElementHelper(){ :Msg = msg }
  }

  class TraceElementHelper implements IReentrant {
    var _startTime : long
    var _msg : Object as Msg

    override function enter() {
      _startTime = System.nanoTime()
      outer.Depth++
    }

    override function exit() {
      var time = (System.nanoTime() - _startTime) / 1000000
      outer.addElement( Msg + " - " + time + " ms " )
      outer.Depth--
    }
  }

  function makeTrace() : String {
    var sb = new StringBuilder()
    sb.append( "TRACE:\n" )
    for( elt in _elements.reverse() ) {
      sb.append( "  ".repeat( elt.Depth ) + elt.Msg + "\n" )
    }
    return sb.toString()
  }

  private static class TraceElement {
    var _depth : int as Depth
    var _msg : Object as Msg
  }
}