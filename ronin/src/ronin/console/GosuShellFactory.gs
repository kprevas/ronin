package ronin.console

uses gw.config.CommonServices
uses gw.lang.parser.*
uses gw.lang.parser.exceptions.ParseResultsException
uses gw.lang.parser.expressions.IVarStatement
uses gw.lang.parser.statements.IStatementList
uses gw.lang.parser.statements.IUsesStatement
uses gw.lang.reflect.TypeSystem
uses gw.lang.reflect.gs.*
uses gw.lang.reflect.java.IJavaType
uses gw.util.GosuStringUtil
uses jline.*
uses org.apache.sshd.common.Factory
uses org.apache.sshd.server.*

uses java.io.*
uses java.lang.*
uses java.lang.reflect.Field
uses java.util.*

internal class GosuShellFactory implements Factory<Command> {
  override function create() : Command {
    return new Command() {
      var _inputStream : InputStream
      var _outputStream : OutputStream
      var _errorStream : OutputStream
      var _exitCallback : ExitCallback
      var _interactiveSymbolTable : ISymbolTable
      var _cr : ConsoleReader
      var _interactiveTypeUsesMap : ITypeUsesMap
      var _destroyed : boolean
      var _thread : Thread

      override function setInputStream(i : InputStream) {
        _inputStream = i
      }

      override function setOutputStream(o : OutputStream) {
        _outputStream = o
      }

      override function setErrorStream(e : OutputStream) {
        _errorStream = e
      }

      override function setExitCallback(c : ExitCallback) {
        _exitCallback = c
      }

      override function start(environment : Environment) {
        _interactiveTypeUsesMap = CommonServices.getGosuIndustrialPark().createTypeUsesMap({})
        _interactiveSymbolTable = new StandardSymbolTable(true)
        Terminal.setupTerminal()
        _cr = new ConsoleReader(_inputStream, new OutputStreamWriter(_outputStream))
        _cr.DefaultPrompt = ">"

        _cr.CompletionHandler = new CandidateListCompletionHandler()
//        _cr.addCompletor( _completionHandler )

        _thread = new Thread() {
          override function run() {
            while (!_destroyed) {
              var expr = readExpr(_cr)
              if (expr == null) {
                return
              }
              var result = tryAsCommand(expr)
              if (result == null) {
                break
              }
              if (result) {
                continue
              }

              try {
                if (!GosuStringUtil.isEmpty(expr)) {
                  interactivelyEvaluate(expr)
                }
              } catch (e : ParseResultsException) {
                _cr.printString(e.getMessage())
              } catch (e) {
                _cr.printString(e.getMessage() ?: "")
                newLine()
                var str = new StringWriter()
                e.printStackTrace(new PrintWriter(str))
                _cr.printString(str.toString())
              }
            }
            _exitCallback.onExit(0, "")
          }
        }
        _thread.start()
      }

      protected function interactivelyEvaluate(expr : String) : Object {
        var gosuProgram = parseProgram(expr)
        var instance = gosuProgram.getProgramInstance()
        var val = instance.evaluate(new ExternalSymbolMapSymbolTableWrapper(_interactiveSymbolTable, true))
        processProgram(gosuProgram, instance)
        var noReturnValue = gosuProgram.getExpression() == null || IJavaType.pVOID.equals(gosuProgram.getExpression().getType())
        if (!noReturnValue) {
          _cr.printString(" = " + StandardSymbolTable.toString(val))
          newLine()
        }
        return val
      }

      private function parseProgram(expr : String) : IGosuProgram {
        var programParser = GosuParserFactory.createProgramParser()
        var parserOptions = new ParserOptions()
        parserOptions.withTypeUsesMap(_interactiveTypeUsesMap)
        var result = programParser.parseExpressionOrProgram(expr, _interactiveSymbolTable, parserOptions)
        return result.getProgram()
      }

      private function tryAsCommand(expr : String) : Boolean {
        expr = expr.trim()
        if ("ls".equals(expr)) {
          var defaultSymbols = new StandardSymbolTable(true)
          var symbols = new ArrayList<ISymbol>(_interactiveSymbolTable.getSymbols().values() as Collection<ISymbol>)
          Collections.sort(symbols, new Comparator<ISymbol>() {
            override function compare(o1 : ISymbol, o2 : ISymbol) : int {
              return o1.Name.compareTo(o2.Name)
            }
          })

          _cr.printString("Symbols : \n\n")
          for (symbol in symbols) {
            if (defaultSymbols.getSymbol(symbol.Name) != null) {
              _cr.printString("    ${symbol.Name} : (builtin)\n")
            } else {
              _cr.printString("    ${symbol.Name} : ${symbol.getType()} = ${StandardSymbolTable.toString(symbol.getValue())}\n")
            }
          }
          newLine()
          return true
        }
        if ("exit".equals(expr) || "quit".equals(expr)) {
          return null
        }
        if ("clear".equals(expr)) {
          _interactiveSymbolTable = new StandardSymbolTable(true)
          return true
        }
        if (expr.startsWith("rm ")) {
          var sym = expr.substring("rm ".length())
          if (_interactiveSymbolTable.getSymbol(sym) == null) {
            _cr.printString("Symbol '" + sym + "' does not exist\n")
          } else {
            try {
              _interactiveSymbolTable.removeSymbol(sym)
            } catch (ex) {
              _cr.printString("Cannot remove built-in symbol '${sym}'\n")
            }
          }
          return true
        }

        return false
      }

      private function processProgram(program : IGosuProgram, instance : IProgramInstance) {
        maybeHandleVar(program, instance)
        maybeHandleUses(program)
      }

      private function maybeHandleUses(program : IGosuProgram) {
        if (program.getTypeUsesMap() != null && program.getTypeUsesMap().getUsesStatements() != null) {
          for (usesStmt in program.getTypeUsesMap().getUsesStatements()) {
            _interactiveTypeUsesMap.addToTypeUses(usesStmt)
          }
        }
      }

      private function maybeHandleVar(program : IGosuProgram, instance : IProgramInstance) {
        if (program.getStatement() typeis IStatementList) {
          var statementList = program.getStatement()
          if (statementList.getStatements() != null &&
                  statementList.getStatements().length == 2 &&
                  statementList.getStatements()[0] typeis IVarStatement) {
            var varStmt = statementList.getStatements()[0] as IVarStatement
            _interactiveSymbolTable.putSymbol(CommonServices.getGosuIndustrialPark().createSymbol(varStmt.getIdentifierName(), varStmt.getType(), getValue(instance, varStmt)))
          }
        }
      }

      private function getValue(instance : IProgramInstance, varStmt : IVarStatement) : Object {
        var value : Object = null
        try {
          return instance[varStmt.getIdentifierName().toString()]
        } catch (e) {
          //ignore
          return null
        }
      }

      private function readExpr(cr : ConsoleReader) : String {
        var s = cr.readLine()
        _cr.printString("\r")
        if (s == null) {
          return null
        }
        var blankLines = 0
        while (eatMore(s)) {
          cr.setDefaultPrompt("...")
          var additionalInput = cr.readLine()
          _cr.printString("\r")

          if (additionalInput.trim().length() == 0) {
            blankLines++
            if (blankLines >= 2) {
              break
            }
          } else {
            blankLines = 0
          }

          s = s + additionalInput + "\n"
        }
        cr.setDefaultPrompt(">")
        return s
      }

      private function eatMore(s : String) : boolean {
        var tokenizer = CommonServices.getGosuIndustrialPark().createSourceCodeTokenizer(s)
        var openParens = tokenizer.countMatches("(")
        var closedParens = tokenizer.countMatches(")")
        if (openParens != closedParens) {
          return true
        }
        var openBraces = tokenizer.countMatches("{")
        var closeBraces = tokenizer.countMatches("}")
        return openBraces != closeBraces
      }

      private function newLine() {
        _cr.printNewline()
        _cr.printString("\r")
      }

      override function destroy() {
        _destroyed = true
      }
    }
  }
}