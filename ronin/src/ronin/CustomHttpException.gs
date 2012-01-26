package ronin

uses javax.servlet.ServletException
uses java.lang.Exception
uses javax.servlet.http.HttpServletRequest
uses javax.servlet.http.HttpServletResponse
uses java.io.PrintWriter
uses ronin.config.DefaultRoninConfig

abstract class CustomHttpException extends ServletException {

  var _status : int

  construct(reason : String, status : int) {
    super(reason)
    _status = status
  }

  construct(reason : String, status : int, causedBy : Exception) {
    super(reason, causedBy)
    _status = status
  }

  function handleException(req : HttpServletRequest, resp : HttpServletResponse) {
    beforeSendError()

    Ronin.log(Message, ERROR, "Ronin", Cause)
    resp.sendError(_status, Message)
    
    afterSendError()
  }

  function beforeSendError() {}

  function afterSendError() {}

}