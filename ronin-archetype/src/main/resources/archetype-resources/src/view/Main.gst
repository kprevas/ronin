<html>
  <head>
    <link type="text/css" rel="stylesheet" href="public/styles.css">
  </head>
  <body>
    <h1><span></span>ronin</h1>
    <% if(ronin.DevServer.getH2WebURL() != null) { %>
      <p><a href="${ronin.DevServer.getH2WebURL()}">database</a></p>
    <% } %>
    <p><a href="http://ronin-web.org/tutorial.html">tutorial</a></p>
    <p><a href="http://ronin-web.org/docs.html">docs</a></p>
  </body>
</html>
