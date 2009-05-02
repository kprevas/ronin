package gw.db

uses java.io.File

class DBTypeInfoTest extends gw.test.TestClass {

  static final var NUM_FOOS = 1

  override function beforeTestMethod() {
      new File(java.lang.System.getProperty("user.dir")).eachChild( \ f -> {
      	if(f.Name.endsWith(".bak")) {
      	    var newFile = new File(f.AbsolutePath.substring(0, f.AbsolutePath.length() - ".bak".length()))
      	    f.copyTo(newFile)
      	}
      } )
  }

  function testTypesCreated() {
      var types = gw.lang.reflect.TypeSystem.getAllTypeNames().where(\ c -> c.toString().startsWith("test.testdb."))

      // TODO H2 returns many tables from INFORMATION_SCHEMA - filter out?
//      assertEquals("Too many types:\n${types.join("\n")}", 3, types.Count)

      assertTrue(types.contains("test.testdb.Foo"))
      assertTrue(types.contains("test.testdb.Bar"))
      assertTrue(types.contains("test.testdb.Transaction"))
  }

  function testPropertiesCreated() {
      var typeinfo = test.testdb.Foo.Type.TypeInfo
      assertEquals(4, typeinfo.Properties.Count)
      
      var idProp = typeinfo.getProperty("id")
      assertNotNull(idProp)
      assertEquals(long, idProp.Type)
      
      var firstNameProp = typeinfo.getProperty("FirstName")
      assertNotNull(firstNameProp)
      assertEquals(String, firstNameProp.Type)
      
      var lastNameProp = typeinfo.getProperty("LastName")
      assertNotNull(lastNameProp)
      assertEquals(String, lastNameProp.Type)
      
      var fkProp = typeinfo.getProperty("Bar")
      assertNotNull(fkProp)
      assertEquals(test.testdb.Bar, fkProp.Type)
      
      typeinfo = test.testdb.Bar.Type.TypeInfo
      assertEquals(4, typeinfo.Properties.Count)
      
      idProp = typeinfo.getProperty("id")
      assertNotNull(idProp)
      assertEquals(long, idProp.Type)
      
      var miscProp = typeinfo.getProperty("Misc")
      assertNotNull(miscProp)
      assertEquals(String, miscProp.Type)
      
      var dateProp = typeinfo.getProperty("Date")
      assertNotNull(dateProp)
      assertEquals(java.sql.Date, dateProp.Type)
      
      var arrayProp = typeinfo.getProperty("Foos")
      assertNotNull(arrayProp)
      assertEquals(List<test.testdb.Foo>, arrayProp.Type)
      assertFalse(arrayProp.Writable)
  }
  
  function testBasicMethodsCreated() {
      var typeinfo : gw.lang.reflect.ITypeInfo = test.testdb.Foo.Type.TypeInfo
      
      var getMethod = typeinfo.getMethod("get", {long})
      assertNotNull(getMethod)
      assertTrue(getMethod.Static)
      assertEquals(test.testdb.Foo, getMethod.ReturnType)
      
      var updateMethod = typeinfo.getMethod("update", {})
      assertNotNull(updateMethod)
      
      var deleteMethod = typeinfo.getMethod("delete", {})
      assertNotNull(deleteMethod)
      
      var findBySqlMethod = typeinfo.getMethod("findWithSql", {String})
      assertNotNull(findBySqlMethod)
      assertTrue(findBySqlMethod.Static)
      assertEquals(List<test.testdb.Foo>, findBySqlMethod.ReturnType)
      /*
      var findMethod = typeinfo.getMethod("find", {test.testdb.Foo})
      assertNotNull(findMethod)
      assertTrue(findMethod.Static)
      assertEquals(List<test.testdb.Foo>, findMethod.ReturnType)
      */
  }
  
  function testGetMethod() {
      var foo = test.testdb.Foo.get(1)
      assertNotNull(foo)
      assertEquals("Charlie", foo.FirstName)
      assertEquals("Brown", foo.LastName)
      
      var noFoo = test.testdb.Foo.get(3582053)
      assertNull(noFoo)
  }
  
  function testFindWithSqlMethod() {
      var foos = test.testdb.Foo.findWithSql("select * from \"Foo\" where \"FirstName\"='Charlie'")
      assertEquals(1, foos.Count)
      var foo = foos[0]
      assertEquals("Charlie", foo.FirstName)
      assertEquals("Brown", foo.LastName)
      
      var noFoo = test.testdb.Foo.findWithSql("select * from \"Foo\" where \"FirstName\"='Rupert'")
      assertEquals(0, noFoo.Count)
  }
  
  function testFindWithRegularColumns() {
      var foos = test.testdb.Foo.find(new test.testdb.Foo(){:FirstName = "Charlie"})
      assertEquals(1, foos.Count)
      var foo = foos[0]
      assertEquals("Charlie", foo.FirstName)
      assertEquals("Brown", foo.LastName)

      var noFoo = test.testdb.Foo.find(new test.testdb.Foo(){:FirstName = "Rupert"})
      assertEquals(0, noFoo.Count)
      
      var allFoos = test.testdb.Foo.find(new test.testdb.Foo())
      assertEquals(NUM_FOOS, allFoos.Count)
      allFoos = test.testdb.Foo.find(null)
      assertEquals(NUM_FOOS, allFoos.Count)
  }
  
  function testFindWithFK() {
      var bar = test.testdb.Bar.get(1)
      var foos = test.testdb.Foo.find(new test.testdb.Foo(){:Bar = bar})
      assertEquals(1, foos.Count)
      var foo = foos[0]
      assertEquals("Charlie", foo.FirstName)
      assertEquals("Brown", foo.LastName)      
  }
  
  function testForeignKey() {
      var foo = test.testdb.Foo.get(1)
      assertEquals(1, foo.Bar.id)
  }
  
  function testArray() {
      var bar = test.testdb.Bar.get(1)
      assertEquals({1 as long}, bar.foos.map(\f -> f.id))
  }
  
  function testDelete() {
      test.testdb.Foo.get(1).delete()
      assertEquals(0, test.testdb.Foo.find(new test.testdb.Foo()).Count)
  }
  
  function testCreateNew() {
      var newFoo = new test.testdb.Foo(){:FirstName = "Linus", :LastName = "Van Pelt"}
      newFoo.update()
      
      assertNotNull(newFoo.id)
      assertEquals(NUM_FOOS + 1, test.testdb.Foo.find(null).Count)
      
      var newFooRetrieved = test.testdb.Foo.get(newFoo.id)
      assertEquals("Linus", newFooRetrieved.FirstName)
      assertEquals("Van Pelt", newFooRetrieved.LastName)
  }
  
  function testUpdateRegularColumns() {
      var foo = test.testdb.Foo.get(1)
      foo.FirstName = "Leroy"
      foo.update()
      
      var retrievedFoo = test.testdb.Foo.get(1)
      assertEquals("Leroy", retrievedFoo.FirstName)
  }
  
  function testUpdateFK() {
      var newBar = new test.testdb.Bar()
      newBar.update()
      
      var foo = test.testdb.Foo.get(1)
      foo.Bar = newBar
      foo.update()
      
      var retrievedFoo = test.testdb.Foo.get(1)
      assertEquals(newBar, retrievedFoo.Bar)
  }
  
  // TODO temporary
  function runAllTests() {
      beforeTestMethod()
      testTypesCreated()
      beforeTestMethod()
      testPropertiesCreated()
      beforeTestMethod()
      testBasicMethodsCreated()
      beforeTestMethod()
      testGetMethod()
      beforeTestMethod()
      testFindWithSqlMethod()
      beforeTestMethod()
      testFindWithRegularColumns()
      beforeTestMethod()
      testFindWithFK()
      beforeTestMethod()
      testForeignKey()
      beforeTestMethod()
      testArray()
      beforeTestMethod()
      testDelete()
      beforeTestMethod()
      testCreateNew()
      beforeTestMethod()
      testUpdateRegularColumns()
      beforeTestMethod()
      testUpdateFK()
  }

}
