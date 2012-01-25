package ronin

uses gw.lang.parser.template.ITemplateObserver
uses gw.lang.parser.template.StringEscaper
uses java.io.Writer
uses gw.lang.reflect.IType
uses java.lang.ThreadLocal
uses gw.util.Stack
uses gw.lang.parser.template.IEscapesAllContent

class RoninTemplateObserver implements IReentrant, ITemplateObserver {

  private static var ESCAPER_STACK = new ThreadLocal<Stack<StringEscaper>>()
  private static var _ESCAPER = new gw.lang.parser.template.IEscapesAllContent(){
    override function escapeBody(s: String): String {
      var escapers = ESCAPER_STACK.get()
      if(escapers?.HasElements) {
        var escaper = escapers.peek()
        if(escaper typeis IEscapesAllContent) {
          return escaper.escapeBody(s)
        }
      }
      return s
    }

    override function escape(s : String):String {
      var escapers = ESCAPER_STACK.get()
      if(escapers?.HasElements) {
        var escaper = escapers.peek()
        return escaper.escape(s)
      }
      return s
    }
  }
  
  static function pushRoninEscaper(esc : StringEscaper) {
    var stack = ESCAPER_STACK.get()
    if(stack == null) {
      stack = new()
      ESCAPER_STACK.set(stack)
    }
    stack.push(esc)
  }

  static function popRoninEscaper() {
    ESCAPER_STACK.get().pop()
  }
  
  override function enter() {
    ITemplateObserver.MANAGER.pushTemplateObserver(this)
  }

  override function exit() {
    ITemplateObserver.MANAGER.popTemplateObserver()
  }

  override function beforeTemplateRender(template: IType, w: Writer): boolean {
    Ronin.CurrentRequest?.beforeRenderTemplate(template)
    return true
  }

  override property get Escaper(): StringEscaper {
    return _ESCAPER
  }

  override function afterTemplateRender(template: IType, w: Writer) {
    Ronin.CurrentRequest?.afterRenderTemplate(template)
  }
}