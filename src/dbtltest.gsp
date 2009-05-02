
//new gw.db.DBTLTestSuite().runSuite()

new gw.db.DBTypeInfoTest().runAllTests()
print("success")

/*
// properties and methods

print("Properties on Foo:")
print(Foo.TypeInfo.Properties.map(\p->"${p.Name} - ${p.Type}"))
print("")
print("Methods on Foo:")
print(Foo.TypeInfo.Methods.map(\p->p.Name))
print("")
print("Properties on Bar:")
print(Bar.TypeInfo.Properties.map(\p->"${p.Name} - ${p.Type}"))
print("")
print("Methods on Bar:")
print(Bar.TypeInfo.Methods.map(\p->p.Name))
print("")

// find a row by ID

var r = Foo.get(1)
print("Foo with id 1:")
print(r)
print("Type of the Foo:")
print(typeof r)
print("")

// follow an FK

print("Column on row referenced by fk:")
print(r.Bar.Date)
print("")

// update the row

r.FirstName += "u"
r.update()

// create a new row; set an FK

var n = new Foo() {:FirstName = "Joe", :LastName = "Schmoe", :Bar = Bar.get(1)}
n.update()
print("Inserted row:")
print(n)
print("")

// evaluate an implied array

print("Array of Foos on Bar with id 1:")
print(Bar.get(1).Foos)
print("")

// delete a row

n.delete()

// create multiple rows in a transaction

using(test.testdb.Transaction) {
	for(i in 5) {
		var j = new Foo() {:FirstName = "Joe", :LastName = "Schmoe ${i}"}
		j.update()
	}
}

// find rows by a column

var joes = Foo.findByFirstName("Joe")
print("all Joes:")
print(joes)
print("")

// delete multiple rows in a transaction

using(test.testdb.Transaction) {
    for(joe in joes) {
        print(joe)
        joe.delete()
    }
//	joes.each(\ joe -> joe.delete())
}
*/