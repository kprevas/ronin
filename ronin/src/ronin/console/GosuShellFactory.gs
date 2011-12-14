package ronin.console

uses gw.config.CommonServices
uses gw.lang.parser.*
uses gw.lang.parser.exceptions.ParseResultsException
uses gw.lang.parser.expressions.*
uses gw.lang.parser.statements.*
uses gw.lang.reflect.*
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
uses gw.lang.reflect.java.JavaTypes

internal class GosuShellFactory implements Factory<Command> {
  override function create() : Command {
    return new Command() {
      var _inputStream : InputStream
      var _outputStream : OutputStream
      var _errorStream : OutputStream
      var _exitCallback : ExitCallback
      var _interactiveSymbolTable : ISymbolTable
      var _cr : ConsoleReader
      var _completionHandler : CompletionHandler
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
        _completionHandler = new CompletionHandler(_interactiveSymbolTable, _interactiveTypeUsesMap);
        Terminal.setupTerminal()
        _cr = new ConsoleReader(_inputStream, new OutputStreamWriter(_outputStream)) {
          override function printColumns(stuff : Collection) {
            for(thing in stuff) {
              this.printString("\r")
              this.printString(thing.toString().trim())
              newLine()
            }
          }
        }
        _cr.DefaultPrompt = "> "

        var x = new CandidateListCompletionHandler()
        _cr.CompletionHandler = x
        _cr.addCompletor(_completionHandler)

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
                printString(e.getMessage())
              } catch (e) {
                printString(e.getMessage() ?: "")
                newLine()
                var str = new StringWriter()
                e.printStackTrace(new PrintWriter(str))
                printString(str.toString())
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
        var noReturnValue = gosuProgram.getExpression() == null || JavaTypes.pVOID().equals(gosuProgram.getExpression().getType())
        if (!noReturnValue) {
          printString(" = " + StandardSymbolTable.toString(val))
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

          printString("Symbols : \n\n")
          for (symbol in symbols) {
            if (defaultSymbols.getSymbol(symbol.Name) != null) {
              printString("    ${symbol.Name} : (builtin)\n")
            } else {
              printString("    ${symbol.Name} : ${symbol.getType()} = ${StandardSymbolTable.toString(symbol.getValue())}\n")
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
            printString("Symbol '" + sym + "' does not exist\n")
          } else {
            try {
              _interactiveSymbolTable.removeSymbol(sym)
            } catch (ex) {
              printString("Cannot remove built-in symbol '${sym}'\n")
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
        try {
          var s = cr.readLine()
          printString("\r")
          if (s == null) {
            return null
          }
          var blankLines = 0
          while (eatMore(s)) {
            cr.setDefaultPrompt("...")
            var additionalInput = cr.readLine()
            printString("\r")

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
          cr.setDefaultPrompt("> ")
          return s
        } catch (e) {
          return null
        }
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
        printString("\r")
      }

      private function printString(s : String) {
        _cr.printString(s.replaceAll("\n", "\r\n"))
      }

      override function destroy() {
        _destroyed = true
      }
      
      private class CompletionHandler implements Completor {
        var _symbolTable : ISymbolTable
        var _typeUsesMap : ITypeUsesMap

        construct(symbolTable : ISymbolTable, typeUsesMap : ITypeUsesMap)
        {
          _symbolTable = symbolTable
          _typeUsesMap = typeUsesMap
        }
    
        override function complete(buffer : String, cursor : int, candidates : List) : int {
          var parser = GosuParserFactory.createParser(buffer, _symbolTable)
          parser.setTypeUsesMap(_typeUsesMap)
          var pe : IParsedElement
          try
          {
            pe = parser.parseExpOrProgram(null)
          }
          catch(e : ParseResultsException)
          {
            pe = e.getParsedElement()
          }
    
          var parseTree = pe.getLocation().getDeepestLocation(cursor, true)
          if(parseTree == null) {
            return 0
          }
    
          var element = parseTree.getParsedElement()
          if(element typeis IIdentifierExpression) {
            return handleIdentifier(candidates, element)
          }
          if(element typeis IMemberAccessExpression) {
            var memberName = element.getMemberName()
            var type = element.getRootType()
            if(type typeis INamespaceType) {
              //need to implement
            }
            else {
              var typeInfo = type.getTypeInfo()
              var featureNames = new ArrayList<String>()

              var propertyInfos = typeInfo.getProperties()
              for(propertyInfo in propertyInfos) {
                if(propertyInfo.getName().startsWith(memberName)) {
                  featureNames.add(propertyInfo.getName())
                }
              }
    
              var methodInfos = typeInfo.getMethods()
              for(mi in methodInfos) {
                if(mi.getName().startsWith(memberName)) {
                  featureNames.add(mi.getName())
                }
              }
    
              Collections.sort(featureNames)
              candidates.addAll(featureNames)
              var ext = element.getRootExpression().getLocation().getExtent()
              return buffer.indexOf('.', ext) + 1
            }
          }
          return 0
        }
    
        private function handleIdentifier(candidates : List, element : IParsedElement) : int {
          var identifier = element as IIdentifierExpression
          var prefix = identifier.getSymbol().getName()
          var symNames = new ArrayList<String>()
          for(symbolName in _symbolTable.getSymbols().keySet()) {
            symNames.add(symbolName.toString())
          }
          Collections.sort(symNames)
          for(name in symNames) {
            if(name.startsWith(prefix)) {
              candidates.add(name)
            }
          }
          return identifier.getLocation().getColumn() - 1
        }
      }
    }
  }
}