<%@ params( t: java.lang.Throwable ) %>
<html>
  <head>
    <link href="http://twitter.github.com/bootstrap/assets/css/bootstrap.css" rel="stylesheet">
  </head>
  <body style="padding:32px">
    <div class="container">
      <h1>An Exception Occurred:</h1>
      <div style="margin-bottom:32px">
        <h2>Message: <em>${t.Message}</em></h2>
      </div>
      <pre>
<%t.printStackTrace(new java.io.PrintWriter(ronin.Ronin.CurrentRequest.Writer))%>
      </pre>
    </div>
  </body>
</html>