package gw.db

uses gw.test.Suite
uses junit.framework.Test

class DBTLTestSuite extends Suite {

  static function suite() : Test {
    return new DBTLTestSuite().withAllTestsInItsModule();
  }

}
