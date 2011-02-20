package ronin.config

/**
 *  Represents the different modes in which an application can be run.
 */
enum ApplicationMode {
  DEVELOPMENT("dev"),
  TESTING("test"),
  STAGING("staging"),
  PRODUCTION("prod")

  var _short : String as ShortName

  private construct(s : String) {
    _short = s
  }

  static function fromShortName(s : String) : ApplicationMode {
    return AllValues.firstWhere(\v -> v.ShortName == s) ?: PRODUCTION
  }
}