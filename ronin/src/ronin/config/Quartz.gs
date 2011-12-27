package ronin.config

uses org.quartz.*
uses org.quartz.impl.*
uses java.util.HashMap
uses java.lang.*
uses java.util.Collections

public class Quartz {

  private static final var TASKS = Collections.synchronizedMap( new HashMap<String, Runnable>() )

  private static var _SCHEDULER : Scheduler as Scheduler

  static function schedule(task : block(),
                    atSecond : Integer = null, atSeconds : Iterable<Integer> = null,
                    atMinute : Integer = null, atMinutes : Iterable<Integer> = null,
                    atHour : Integer = null, atHours : Iterable<Integer> = null,
                    onDayOfMonth : Integer = null, onDaysOfMonth : Iterable<Integer> = null,
                    onDay  : Day = null, onDays : Iterable<Day> = null,
                    inMonth  : Month = null, inMonths : Iterable<Month> = null,
                    cronString : String  = null,
                    jobName : String = null) {

    if( cronString == null  ) {

      var explicitSeconds = false
      var secondString = "0"
      if( atSeconds != null ) {
        secondString = atSeconds.join( "," )
        explicitSeconds = true
      } else if( atSecond != null ) {
        secondString = atSecond.toString() 
        explicitSeconds = true
      }

      var explicitMinutes = false
      var minuteString = explicitSeconds ? "*" : "0"
      if( atMinutes != null ) {
        minuteString = atMinutes.join( "," )
      } else if( atMinute != null ) {
        minuteString = atMinute.toString() 
      }
                      
      var hourString = explicitMinutes or explicitSeconds ? "*" : "0"
      if( atHours != null ) {
        hourString = atHours.join( "," )
      } else if( atHour != null ) {
        hourString = atHour.toString() 
      }
  
      var dayOfMonthString = "?"
      if(onDaysOfMonth != null) {
        dayOfMonthString = onDaysOfMonth.join(",") 
      } else if( onDayOfMonth != null ) {
        dayOfMonthString = onDayOfMonth.toString()
      }
  
      var dayOfWeekString = "?"
      if( dayOfMonthString == "?" ) {
        if(onDays != null) {
          dayOfWeekString = onDays.map( \ d -> d.DayCode  ).join(",") 
        } else if( onDay != null ) {
          dayOfWeekString = onDay.DayCode.toString()
        }
      }
    
      if( dayOfWeekString == "?" and dayOfMonthString == "?" ) {
        dayOfMonthString = "*"
      }

      var monthString = "*"    
      if(inMonths != null) {
        monthString = inMonths.map( \ d -> d.MonthCode  ).join(",") 
      } else if( inMonth != null ) {
        monthString = inMonth.MonthCode.toString()
      }
      
      cronString = secondString + " " + minuteString + " " + hourString + " " + dayOfMonthString + " " + monthString + " " + dayOfWeekString
    }
    scheduleImpl(cronString, jobName, task )
  }

  static function maybeStart() {
    if(TASKS.size() > 0) {
      SCHEDULER.start()
    }
  }

  private static function scheduleImpl(cronExpression : String , jobName : String, task: Runnable )  {
    using( TASKS as IMonitorLock) {
      var taskId = TASKS.size()
      if( jobName == null ) {
        jobName = "RoninJob" + taskId
      }
      var job = new JobDetail(jobName, "RoninGroup", RoninJobClass)
      var trigger = new CronTrigger("CronTrigger" + taskId, "RoninGroup", jobName, "RoninGroup", cronExpression)
      TASKS.put(jobName, task)
      if(_SCHEDULER == null) {
        _SCHEDULER = new StdSchedulerFactory().getScheduler()
      }
      _SCHEDULER.scheduleJob(job, trigger)
    }
  }

  static class RoninJobClass implements Job {
    override function execute(ctx : JobExecutionContext ) {
      var name = ctx.getJobDetail().getName()
      var runnable = TASKS.get(name)
      runnable.run()
    }
  }

  public static enum Day {
    SUNDAY("SUN"),
    MONDAY("MON"),
    TUESDAY("TUE"),
    WEDNESDAY("WED"),
    THURSDAY("THU"),
    FRIDAY("FRI"),
    SATURDAY("SAT"),
    LAST_SUNDAY("SUNL"),
    LAST_MONDAY("MONL"),
    LAST_TUESDAY("TUEL"),
    LAST_WEDNESDAY("WEDL"),
    LAST_THURSDAY("THUL"),
    LAST_FRIDAY("FRIL"),
    LAST_SATURDAY("SATL")

    private construct( c : String ) {
      _code = c
    }
  
    var _code : String as DayCode
  }

  public static enum Month {
    JANUARY("JAN"),
    FEBRUARY("FEB"),
    MARCH("MAR"),
    APRIL("APR"),
    MAY("MAY"),
    JUNE("JUN"),
    JULY("JUL"),
    AUGUST("AUG"),
    SEPTEMBER("SEP"),
    OCTOBER("OCT"),
    NOVEMBER("NOV"),
    DECEMBER("DEC")
    private construct( c : String ) {
      _code = c
    }
    var _code : String as MonthCode
  }
}