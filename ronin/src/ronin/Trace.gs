package ronin

uses ronin.config.*
uses java.util.*
uses java.lang.*
uses java.text.DecimalFormat
uses org.slf4j.profiler.*

/**
 *  A handler for low-level trace messages.
 */
class Trace {

  private static final var DECIMAL = new DecimalFormat("0.000")

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

  override function toString() : String {
    var sb = new StringBuilder()
    _currentElement.write(sb)
    return sb.toString()
  }

  /**
   *  A single element in the low-level trace.
   */
  class TraceElement implements IReentrant {

    /**
     *  The message associated with this element, or a block which generates same.
     */
    var _msg : Object as Msg
    /**
     *  The parent element of this element.
     */
    var _parent : TraceElement as Parent
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
    var _profiler : Profiler

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
      var actualMessage = Msg
      if(actualMessage typeis block():String) {
        actualMessage = (actualMessage as block():String)()
      }
      if(Parent?._profiler != null) {
        _profiler = Parent._profiler.startNested(actualMessage as String)
      } else {
        _profiler = new Profiler(actualMessage as String)
      }
      ProfilerRegistry.getThreadContextInstance().put("_REQUEST", _profiler)
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
      _profiler.stop()
    }

    internal function write(sb : StringBuilder) {
      if(_profiler != null) {
        write(_profiler, sb, 0)
      } else {
        Children.each(\ c -> c.write(sb))
      }
    }

    private function write(prof : TimeInstrument, sb : StringBuilder, indent : int) {
      sb.append("  ".repeat(indent))
      sb.append(prof.Name)

      //optional timing info
      if(PrintTiming) {
        sb.append(" - ").append(DECIMAL.format(prof.elapsedTime() / 1000000.0)).append(" ms")
      }

      sb.append("\n")
      if(prof typeis Profiler) {
        prof.CopyOfChildTimeInstruments.each(\ p -> {
          write(p, sb, indent + 1)
        })
      }
    }
  }
}