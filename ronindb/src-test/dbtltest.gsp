classpath ".,../build/ronindb.jar,../../lib"

uses ronindb.test.*

var result = org.junit.runner.JUnitCore.runClasses({DBTypeInfoTest})
for(failure in result.Failures) {
  print("")
  print(failure.TestHeader)
  failure.Exception.printStackTrace()
}
print("Results: ${result.FailureCount}/${result.RunCount} failed")
