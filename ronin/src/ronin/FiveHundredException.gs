package ronin

uses java.lang.Exception
uses javax.servlet.ServletException

/**
 *  Represents a 500 error (internal server error).
 */
class FiveHundredException extends ServletException {
 construct(_reason : String) {
   super(_reason)
 }
 construct(_reason : String, _cause : Exception) {
   super(_reason, _cause)
 }
}
