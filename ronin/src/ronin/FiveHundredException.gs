package ronin

uses java.lang.Exception

class FiveHundredException extends Exception {
 construct(_reason : String) {
   super(_reason)
 }
 construct(_reason : String, _cause : Exception) {
   super(_reason, _cause)
 }
}
