<html>
  <head>
    <link type="text/css" rel="stylesheet" href="public/styles.css">
  </head>
  <body>
    <h1><span></span>ronin</h1>
    <% if(ronin.DevServer.getH2WebURL() != null) { %>
      <p><a href="${ronin.DevServer.getH2WebURL()}">database</a></p>
    <% } %>
    <p><a href="https://github.com/kprevas/ronin/wiki/Tutorial">tutorial</a></p>
    <p><a href="https://github.com/kprevas/ronin/wiki/Ronin">docs</a></p>
  </body>
</html>
