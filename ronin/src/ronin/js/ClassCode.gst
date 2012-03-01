<%@ params( req : javax.servlet.ServletRequest, clazz: gw.lang.reflect.gs.IGosuClass ) %>
controller.${clazz.RelativeName} = {}
<% for(m in clazz.TypeInfo.DeclaredMethods.where( \ e -> e.Public )) {
%>controller.${clazz.RelativeName}.${m.DisplayName} = function() {
  $.ajax('http://${req.ServerName}:${req.ServerPort}${req.ServletContext.ContextPath}/${clazz.RelativeName}/${m.DisplayName}', 
         {'success':function(data){console.log(data)}});
}
<% } %>