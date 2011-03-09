package ronin

uses java.lang.Exception
uses javax.servlet.ServletException

/**
 *  Represents a 404 error (not found).
 */
class FourOhFourException extends ServletException {
 construct(_reason : String) {
   super(_reason)
 }
 construct(_reason : String, _cause : Exception) {
   super(_reason, _cause)
 }
}
