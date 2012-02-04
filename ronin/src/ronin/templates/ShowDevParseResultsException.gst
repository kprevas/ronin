<%@ params( t: gw.lang.parser.exceptions.ErrantGosuClassException ) %>
<html>
  <head>
    <link href="http://twitter.github.com/bootstrap/assets/css/bootstrap.css" rel="stylesheet">
  </head>
  <body style="padding:32px">
    <div class="container">
      <h1 style="margin-bottom:32px">${t.GsClass.Name} is not valid:</h1>
      <pre>
${t.GsClass.ParseResultsException.Feedback}
      </pre>
    </div>
  </body>
</html>