package ronindb;

import gw.config.CommonServices;
import gw.lang.IReentrant;
import gw.lang.function.IBlock;
import gw.lang.parser.*;
import gw.lang.parser.exceptions.ParseResultsException;
import gw.lang.reflect.features.IMethodReference;
import gw.util.CaseInsensitiveHashMap;
import gw.util.concurrent.LazyVar;

public class Logger {

  private static LazyVar<IMethodReference> LOG_METHOD = new LazyVar<IMethodReference>() {
    @Override
    protected IMethodReference init() {
      return (IMethodReference) eval("return ronin.Ronin#log(Object, ronin.config.LogLevel, String, java.lang.Throwable)");
    }
  };

  private static LazyVar<IMethodReference> TRACE_METHOD = new LazyVar<IMethodReference>() {
    @Override
    protected IMethodReference init() {
      if (Boolean.TRUE.equals(eval("return ronin.Ronin.TraceEnabled"))) {
        return (IMethodReference) eval("return ronin.Ronin#CurrentTrace#withMessage(Object, boolean)");
      } else {
        return null;
      }
    }
  };

  public static void log(String msg) {
    IMethodReference logMethod = LOG_METHOD.get();
    if (logMethod != null) {
      IBlock log = (IBlock) logMethod.toBlock();
      log.invokeWithArgs(msg, null, null, null);
    }
  }

  public static IReentrant withTraceElement(String msg, boolean printTiming)  {
    IMethodReference traceMethod = TRACE_METHOD.get();
    if (traceMethod != null) {
      IBlock trace = (IBlock) traceMethod.toBlock();
      return (IReentrant) trace.invokeWithArgs(msg, printTiming);
    } else {
      return null;
    }
  }

  private static Object eval(String s) {
    IGosuParser parser = GosuParserFactory.createParser(s);
    try {
      return parser.parseProgram(null).getGosuProgram().evaluate(new ExternalSymbolMapForMap(new CaseInsensitiveHashMap<CaseInsensitiveCharSequence, ISymbol>()));
    } catch (ParseResultsException e) {
      CommonServices.getEntityAccess().getLogger().warn("Could not find logging infrastructure.  Logging will be disabled for RoninDB.");
    }
    return null;
  }
}
