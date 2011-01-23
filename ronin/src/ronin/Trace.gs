package ronin

uses ronin.config.*
uses java.util.*
uses java.lang.*

/**
 *  A handler for low-level trace messages.
 */
class Trace {
  var _currentElement = new TraceElement() {:Msg = "TRACE", :PrintTiming = true}

  /**
   *  Creates a trace element with the given message.
   *  @param msg The text of the message, or a block which returns said text.
   *  @param printTiming (Optional) Whether to print the elapsed time with the trace message.  Defaults to true.
   *  @return An object which can be passed to a using() statement surrounding the code to be traced.
   */
  function withMessage(msg : Object, printTiming : boolean = true) : TraceElement {
    return new TraceElement(){:Msg = msg, :PrintTiming = printTiming}
  }

  /**
   *  Adds a simple trace message with no children and no timing information.
   *  @param msg The text of the message, or a block which returns said text.
   */
  function addMessage(msg : Object) {
    using (new TraceElement(){:Msg = msg}) {/* nothing */}
  }

  /**
   *  A single element in the low-level trace.
   */
  class TraceElement implements IReentrant {

    /**
     *  The message associated with this element, or a block which generates same.
     */
    var _msg : Object as Msg

    var _parent : TraceElement
    /**
     *  The parent element of this element.
     */
    property get Parent() : TraceElement {
      return _parent
    }
    property set Parent(p : TraceElement) {
      _parent = p
      _indent = p.Indent + 1
    }

    /**
     *  The child elements of this element.
     */
    var _children : List<TraceElement> as readonly Children = new ArrayList<TraceElement>()
    /**
     *  Whether to display timing information with this element.
     */
    var _printTime : boolean as PrintTiming
    var _startTime : long = -1
    var _endTime : long = -1

    var _indent : int = 0
    private property get Indent() : int {
      return _indent
    }

    override function enter() {
      start()
    }

    override function exit() {
      end()
    }

    private function start() {
      if(_startTime != -1) {
        Msg = "Already started timing this trace element: '${Msg}'"
      }
      _startTime = System.nanoTime()
      Parent = _currentElement
      verifyParent(this)
      Parent.Children.add(this)
      _currentElement = this
      if(Ronin.TraceEnabled) {
        var sb = new StringBuilder()
        write(_indent, sb, false)
        Ronin.log(sb.toString(), INFO, "Ronin", null)
      }
    }

    private function verifyParent(elt : TraceElement) {
      if(Parent == elt) {
        elt.Msg = "Circular trace pushed: '${elt.Msg}'.  Do you have balanced TraceElements?"
      }
      if(Parent != null) Parent.verifyParent(elt)
    }

    private function end() {

      if(this != _currentElement) {
        Msg = "Unbalanced TraceElements: '${Msg}'"
      } else if(_startTime == -1) {
        Msg = "Didn't start timing this trace element: '${Msg}'"
      } else if(_endTime != -1) {
        Msg = "Already ended timing this trace element: '${Msg}'"
      }
      _endTime = System.nanoTime()
      _currentElement = Parent
      if(Ronin.TraceEnabled) {
        var sb = new StringBuilder()
        write(_indent, sb, true)
        Ronin.log(sb.toString(), INFO, "Ronin", null)
      }
    }

    internal function write(i : int, sb : StringBuilder, end : boolean) {
      // indented message
      var actualMessage = Msg
      if(actualMessage typeis block():String) {
        actualMessage = (actualMessage as block():String)()
      }
      sb.append("  ".repeat(i))
      sb.append(actualMessage)
      sb.append(end ? " end" : " start")

      //optional timing info
      if(end and PrintTiming and _startTime != -1 and _endTime != -1) {
        var time = (_endTime - _startTime) / 1000000
        sb.append(" - ").append(time).append(" ms ")
      }

    }
  }
}