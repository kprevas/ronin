package gw.simplewebtest

uses gw.test.Suite
uses junit.framework.Test

class RoninTestSuite extends Suite {

  static function suite() : Test {
    return new RoninTestSuite()
  }

}
