package ronindb;

import gw.config.CommonServices;
import gw.lang.function.IBlock;
import gw.lang.parser.*;
import gw.lang.parser.exceptions.ParseResultsException;
import gw.lang.reflect.features.IMethodReference;
import gw.util.CaseInsensitiveHashMap;
import gw.util.concurrent.LazyVar;

import java.util.HashMap;

public class Logger {

  private static LazyVar<IMethodReference> LOG_METHOD = new LazyVar<IMethodReference>() {
    @Override
    protected IMethodReference init() {
      return (IMethodReference) eval("return ronin.RoninServlet#Instance#_log(Object, ronin.config.LogLevel, String, java.lang.Throwable)");
    }
  };

  private static LazyVar<IMethodReference> TRACE_METHOD = new LazyVar<IMethodReference>() {
    @Override
    protected IMethodReference init() {
      if (Boolean.TRUE.equals(eval("return ronin.RoninServlet.Instance.TraceEnabled"))) {
        return (IMethodReference) eval("return ronin.RoninServlet#Instance#addTraceElement(Object)");
      } else {
        return null;
      }
    }
  };

  private static LazyVar<IMethodReference> INCREMENT_DEPTH = new LazyVar<IMethodReference>() {
    @Override
    protected IMethodReference init() {
      if (Boolean.TRUE.equals(eval("return ronin.RoninServlet.Instance.TraceEnabled"))) {
        return (IMethodReference) eval("return ronin.RoninServlet#Instance#incrementTraceDepth()");
      } else {
        return null;
      }
    }
  };

  private static LazyVar<IMethodReference> DECREMENT_DEPTH = new LazyVar<IMethodReference>() {
    @Override
    protected IMethodReference init() {
      if (Boolean.TRUE.equals(eval("return ronin.RoninServlet.Instance.TraceEnabled"))) {
        return (IMethodReference) eval("return ronin.RoninServlet#Instance#decrementTraceDepth()");
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

  public static void trace(String msg) {
    IMethodReference traceMethod = TRACE_METHOD.get();
    if (traceMethod != null) {
      incrementTraceDepth();
      IBlock trace = (IBlock) traceMethod.toBlock();
      trace.invokeWithArgs(msg);
      decrementTraceDepth();
    }
  }

  public static void decrementTraceDepth() {
    IMethodReference reference = DECREMENT_DEPTH.get();
    if (reference != null) {
      IBlock decrement = (IBlock) reference.toBlock();
      decrement.invokeWithArgs();
    }
  }

  public static void incrementTraceDepth() {
    IMethodReference reference = INCREMENT_DEPTH.get();
    if (reference != null) {
      IBlock increment = (IBlock) reference.toBlock();
      increment.invokeWithArgs();
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
