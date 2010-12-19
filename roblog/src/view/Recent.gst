<%@ extends ronin.RoninTemplate %>
<%@ params(posts : List<db.roblog.Post>, eachPost(post : db.roblog.Post), prevLink : boolean, page : int) %>
<% uses controller.* %>

<% posts.each(\ post -> eachPost(post)) %>

<% if(prevLink) { %>
    <div class="prevLink"><a href="${urlFor(\ -> PostCx.recent(page + 1))}">Older posts</a></div>
<% } %>
<% if(page > 0) { %>
    <div class="nextLink"><a href="${urlFor(\ -> PostCx.recent(page - 1))}">Newer posts</a></div>
<% } %>