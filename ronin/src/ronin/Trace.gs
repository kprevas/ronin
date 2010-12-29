package ronin

uses ronin.config.*
uses java.util.*
uses java.lang.*

class Trace {
  var _currentElement = new TraceElement() { :Msg = "TRACE", :PrintTiming = true }

  function withMessage( msg : Object, printTiming : boolean = true ) : TraceElement {
    return new TraceElement(){ :Msg = msg, :PrintTiming = printTiming }
  }

  function addMessage( msg : Object ) {
    using ( new TraceElement(){ :Msg = msg } ) { /* nothing */ }
  }

  function toString() : String {
    var sb = new StringBuilder()
    _currentElement.write( 0, sb )
    return sb.toString()
  }

  class TraceElement implements IReentrant {

    var _msg : Object as Msg
    var _parent : TraceElement as Parent
    var _children : List<TraceElement> as readonly Children = new ArrayList<TraceElement>()
    var _printTime : boolean as PrintTiming
    var _startTime : long = -1
    var _endTime : long = -1

    override function enter() {
      start()
    }

    override function exit() {
      end()
    }

    function start() {
      if( _startTime != -1 ) {
        Msg = "Already started timing this trace element: '${Msg}'"
      }
      _startTime = System.nanoTime()
      Parent = _currentElement
      verifyParent(this)
      Parent.Children.add( this )
      _currentElement = this
    }

    private function verifyParent( elt : TraceElement ) {
      if(Parent == elt) {
        elt.Msg = "Circular trace pushed: '${elt.Msg}'.  Do you have balanced TraceElements?"
      }
      if(Parent != null) Parent.verifyParent( elt )
    }

    function end() {

      if( this != _currentElement ) {
        Msg = "Unbalanced TraceElements: '${Msg}'"
      } else if( _startTime == -1 ) {
        Msg = "Didn't start timing this trace element: '${Msg}'"
      } else if( _endTime != -1 ) {
        Msg = "Already ended timing this trace element: '${Msg}'"
      }
      _endTime = System.nanoTime()
      _currentElement = Parent
    }

    function write( i : int, sb : StringBuilder ) {
      // indented message
      var actualMessage = Msg
      if( actualMessage typeis block():String ) {
        actualMessage = (actualMessage as block():String)()
      }
      sb.append( "  ".repeat( i ) )
      sb.append( actualMessage )

      //optional timing info
      if( PrintTiming and _startTime != -1 and _endTime != -1 ) {
        var time = (_endTime - _startTime) / 1000000
        sb.append(" - ").append(time).append(" ms ")
      }

      //children
      sb.append("\n")
      Children.each( \ c -> c.write( i + 1, sb ) )
    }
  }
}