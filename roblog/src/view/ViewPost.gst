<%@ extends ronin.RoninTemplate %>
<%@ params(post : db.roblog.Post, prevLink : boolean, nextLink : boolean, canEdit : boolean, viewLink : boolean) %>
<div class="header">${h(post.Title)}</div>
<div class="body">${h(post.Body)}</div>
<% if(prevLink) { %>
<div class="prevLink"><a href="${urlFor(\ -> controller.Post.prev(post))}">Previous post</a></div>
<% } %>
<% if(nextLink) { %>
<div class="nextLink"><a href="${urlFor(\ -> controller.Post.next(post))}">Next post</a></div>
<% } %>
<% if(viewLink) { %>
<div class="viewLink"><a href="${urlFor(\ -> controller.Post.viewPost(post))}">
<% var commentCount = db.roblog.Comment.count(new db.roblog.Comment(){:Post = post}) %>
<% if(commentCount == 0) { %>
Comment
<% } else if(commentCount == 1) { %>
1 comment
<% } else { %>
${commentCount} comments
<% } %>
</a></div>
<% } %>
<% if(canEdit) { %>
<div class="editLink"><a href="${urlFor(\ -> controller.Admin.editPost(post))}">Edit</a></div>
<div class="deleteLink"><a href="${urlFor(\ -> controller.Admin.deletePost(post))}">Delete</a></div>
<% } %>
<div class="posted">Posted on ${post.Posted}</div>
