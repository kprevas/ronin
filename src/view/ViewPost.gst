<%@ extends gw.simpleweb.SimpleWebTemplate %>
<%@ params(post : db.roblog.Post, prevLink : boolean, nextLink : boolean) %>
<div class="header">${h(post.Title)}</div>
<div class="body">${h(post.Body)}</div>
<div class="posted">Posted on ${post.Posted}</div>
<% if(prevLink) { %>
<div class="prevLink"><a href="${urlFor(\ -> controller.Post.prev(post))}">Previous post</a></div>
<% } %>
<% if(nextLink) { %>
<div class="prevLink"><a href="${urlFor(\ -> controller.Post.next(post))}">Next post</a></div>
<% } %>