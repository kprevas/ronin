package gw.db

uses java.io.*
uses gw.lang.reflect.IPropertyInfo

class DBTypeInfoTest extends gw.test.TestClass {

  static final var NUM_FOOS = 1

  override function beforeTestMethod() {
      new File(java.lang.System.getProperty("user.dir")).eachChild( \ f -> {
      	if(f.Name.endsWith(".bak")) {
      	    var newFile = new File(f.AbsolutePath.substring(0, f.AbsolutePath.length() - ".bak".length()))
      	    f.copyTo(newFile)
      	} else if(f.Name.endsWith(".log.db")) {
      	    f.delete()
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
      assertEquals(6, typeinfo.Properties.Count)
      
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
      
      var textProp = typeinfo.getProperty("Address")
      assertNotNull(textProp)
      assertEquals(String, textProp.Type)
      
      typeinfo = test.testdb.Bar.Type.TypeInfo
      assertEquals(5, typeinfo.Properties.Count)
      
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
      
      var getMethod = typeinfo.getMethod("fromID", {long})
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
      
      var findMethod = typeinfo.getMethod("find", {test.testdb.Foo})
      assertNotNull(findMethod)
      assertTrue(findMethod.Static)
      assertEquals(List<test.testdb.Foo>, findMethod.ReturnType)
      
      var countBySqlMethod = typeinfo.getMethod("countWithSql", {String})
      assertNotNull(countBySqlMethod)
      assertTrue(countBySqlMethod.Static)
      assertEquals(int, countBySqlMethod.ReturnType)
      
      var countMethod = typeinfo.getMethod("count", {test.testdb.Foo})
      assertNotNull(countMethod)
      assertTrue(countMethod.Static)
      assertEquals(int, countMethod.ReturnType)
      
      var findSortedMethod = typeinfo.getMethod("findSorted", {test.testdb.Foo, IPropertyInfo, boolean})
      assertNotNull(findSortedMethod)
      assertTrue(findSortedMethod.Static)
      assertEquals(List<test.testdb.Foo>, findSortedMethod.ReturnType)
      
      var findPagedMethod = typeinfo.getMethod("findPaged", {test.testdb.Foo, int, int})
      assertNotNull(findPagedMethod)
      assertTrue(findPagedMethod.Static)
      assertEquals(List<test.testdb.Foo>, findPagedMethod.ReturnType)
      
      var findSortedPagedMethod = typeinfo.getMethod("findSortedPaged", {test.testdb.Foo, IPropertyInfo, boolean, int, int})
      assertNotNull(findSortedPagedMethod)
      assertTrue(findSortedPagedMethod.Static)
      assertEquals(List<test.testdb.Foo>, findSortedPagedMethod.ReturnType)
      
  }
  
  function testGetMethod() {
      var foo = test.testdb.Foo.fromID(1)
      assertNotNull(foo)
      assertEquals("Charlie", foo.FirstName)
      assertEquals("Brown", foo.LastName)
      
      var noFoo = test.testdb.Foo.fromID(3582053)
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
  
  function testFindSorted() {
      var sorted = test.testdb.SortPage.findSorted(null, test.testdb.SortPage.Type.TypeInfo.getProperty("Number"), true)
      sorted.eachWithIndex(\s, i -> {
        assertTrue(i == 0 or s.Number >= sorted[i - 1].Number)
      })
  }
  
  function testFindPaged() {
      var page1 = test.testdb.SortPage.findPaged(null, 10, 0)
      var page2 = test.testdb.SortPage.findPaged(null, 10, 10)
      assertEquals(10, page1.Count)
      assertEquals(10, page2.Count)
      page1.each(\s -> {
          assertNull(page2.firstWhere(\s2 -> s2.id == s.id))
      })
  }
  
  function testFindSortedPaged() {
      var page1 = test.testdb.SortPage.findSortedPaged(null, test.testdb.SortPage.Type.TypeInfo.getProperty("Number"), true, 10, 0)
      var page2 = test.testdb.SortPage.findSortedPaged(null, test.testdb.SortPage.Type.TypeInfo.getProperty("Number"), true, 10, 10)
      assertEquals(10, page1.Count)
      assertEquals(10, page2.Count)
      page1.eachWithIndex(\s, i -> {
          assertTrue(i == 0 or s.Number >= page1[i - 1].Number)
          assertNull(page2.firstWhere(\s2 -> s2.id == s.id or s2.Number < s.Number))
      })
  }
  
  function testCount() {
      assertEquals(20, test.testdb.SortPage.count(null))
      assertEquals(4, test.testdb.SortPage.count(new test.testdb.SortPage(){:Number = 1}))
  }
  
  function testCountWithSql() {
      assertEquals(8, test.testdb.SortPage.countWithSql("select count(*) as count from \"SortPage\" where \"Number\" < 3"))
  }
  
  function testFindWithFK() {
      var bar = test.testdb.Bar.fromID(1)
      var foos = test.testdb.Foo.find(new test.testdb.Foo(){:Bar = bar})
      assertEquals(1, foos.Count)
      var foo = foos[0]
      assertEquals("Charlie", foo.FirstName)
      assertEquals("Brown", foo.LastName)      
  }
  
  function testForeignKey() {
      var foo = test.testdb.Foo.fromID(1)
      assertEquals(1, foo.Bar.id)
  }
  
  function testArray() {
      var bar = test.testdb.Bar.fromID(1)
      assertEquals({1 as long}, bar.foos.map(\f -> f.id))
  }
  
  function testDelete() {
      test.testdb.Foo.fromID(1).delete()
      assertEquals(0, test.testdb.Foo.find(new test.testdb.Foo()).Count)
  }
  
  function testCreateNew() {
      var newFoo = new test.testdb.Foo(){:FirstName = "Linus", :LastName = "Van Pelt"}
      newFoo.update()
      
      assertNotNull(newFoo.id)
      assertEquals(NUM_FOOS + 1, test.testdb.Foo.find(null).Count)
      
      var newFooRetrieved = test.testdb.Foo.fromID(newFoo.id)
      assertEquals("Linus", newFooRetrieved.FirstName)
      assertEquals("Van Pelt", newFooRetrieved.LastName)
  }
  
  function testUpdateRegularColumns() {
      var foo = test.testdb.Foo.fromID(1)
      foo.FirstName = "Leroy"
      foo.update()
      
      var retrievedFoo = test.testdb.Foo.fromID(1)
      assertEquals("Leroy", retrievedFoo.FirstName)
  }
  
  function testUpdateTextColumn() {
      var foo = test.testdb.Foo.fromID(1)
      foo.Address = "54321 Centre Ave.\nMiddleton, IA 52341"
      foo.update()
      
      var retrievedFoo = test.testdb.Foo.fromID(1)
      assertEquals("54321 Centre Ave.\nMiddleton, IA 52341", retrievedFoo.Address)
  }
  
  function testUpdateFK() {
      var newBar = new test.testdb.Bar()
      newBar.update()
      
      var foo = test.testdb.Foo.fromID(1)
      foo.Bar = newBar
      foo.update()
      
      var retrievedFoo = test.testdb.Foo.fromID(1)
      assertEquals(newBar, retrievedFoo.Bar)
  }
  
  function testTextColumn() {
      var foo = test.testdb.Foo.fromID(1)
      assertEquals("1234 Main St.\nCentreville, KS 12345", foo.Address)
  }
  
  function testNewProperty() {
      var newFoo = new test.testdb.Foo()
      assertTrue(newFoo._New)
      
      var oldFoo = test.testdb.Foo.fromID(1)
      assertFalse(oldFoo._New)
  }
  
  function testSingleQuoteEscape() {
      var foo = new test.testdb.Foo(){:FirstName = "It's-a", :LastName = "me!!"}
      foo.update()
      
      var retrievedFoo = test.testdb.Foo.fromID(foo.id)
      assertEquals("It's-a", retrievedFoo.FirstName)
  }
  
}
