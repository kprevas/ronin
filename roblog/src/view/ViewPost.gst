 <%@ extends ronin.RoninTemplate %>
 <%@ params(aPost : db.roblog.Post, prevLink : boolean, nextLink : boolean, canEdit : boolean, viewLink : boolean) %>
 <% uses controller.* %>
 <% uses db.roblog.Comment %>
 <% uses java.text.MessageFormat %>

 <div class="header">${h(aPost.Title)}</div>
 <div class="body">${h(aPost.Body)}</div>
 <% if(prevLink) { %>
     <div class="prevLink"><a href="${urlFor(PostCx#prev(aPost))}">${strings.PreviousPost}</a></div>
 <% }
    if(nextLink) { %>
     <div class="nextLink"><a href="${urlFor(PostCx#next(aPost))}">${strings.NextPost}</a></div>
 <% }
    if(viewLink) { %>
     <div class="viewLink"><a href="${urlFor(PostCx#viewPost(aPost))}">
       <% var commentCount = Comment.count(new Comment(){:Post = aPost}) %>
       <% if(commentCount == 0) { %>
       ${strings.Comment}
       <% } else if(commentCount == 1) { %>
       ${strings.OneComment}
       <% } else { %>
       ${MessageFormat.format(strings.NComments, {commentCount})}
       <% } %>
       </a>
     </div>
 <% }
    if(canEdit) { %>
     <div class="editLink"><a href="${urlFor(AdminCx#editPost(aPost))}">${strings.Edit}</a></div>
     <div class="deleteLink"><a href="${urlFor(AdminCx#deletePost(aPost))}">${strings.Delete}</a></div>
 <% } %>

 <div class="posted">${MessageFormat.format(strings.PostedOn, {aPost.Posted})}</div>
