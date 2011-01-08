uses ronindb.test.*

var result = org.junit.runner.JUnitCore.runClasses({DBTypeInfoTest})
print("Results: ${result.FailureCount}/${result.RunCount} failed")
for(failure in result.Failures) {
  print("")
  print(failure.TestHeader)
  failure.Exception.printStackTrace()
}