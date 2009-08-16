package gw.simplewebtest

uses gw.test.Suite
uses junit.framework.Test

class SimpleWebTestSuite extends Suite {

  static function suite() : Test {
    return new SimpleWebTestSuite()
  }

}
