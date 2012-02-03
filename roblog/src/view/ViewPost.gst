 <%@ extends ronin.RoninTemplate %>
 <%@ params(aPost : db.roblog.Post, prevLink : Boolean, nextLink : Boolean, canEdit : Boolean, viewLink : Boolean) %>
 <% uses controller.* %>
 <% uses db.roblog.Comment %>

 <div class="header">${h(aPost.Title)}</div>
 <div class="body">${h(aPost.Body)}</div>
 <% if(prevLink) { %>
     <div class="prevLink"><a href="${urlFor(PostCx#prev(aPost))}">${Strings.PreviousPost}</a></div>
 <% }
    if(nextLink) { %>
     <div class="nextLink"><a href="${urlFor(PostCx#next(aPost))}">${Strings.NextPost}</a></div>
 <% }
    if(viewLink) { %>
     <div class="viewLink"><a href="${urlFor(PostCx#viewPost(aPost))}">
       <% var commentCount = Comment.countLike(new Comment() {:Post = aPost}) %>
       <% if(commentCount == 0) { %>
       ${Strings.Comment}
       <% } else if(commentCount == 1) { %>
       ${Strings.OneComment}
       <% } else { %>
       ${Strings.NComments.formatMessage({commentCount})}
       <% } %>
       </a>
     </div>
 <% }
    if(canEdit) { %>
     <div class="editLink"><a href="${urlFor(AdminCx#editPost(aPost))}">${Strings.Edit}</a></div>
     <div class="deleteLink"><a href="${urlFor(AdminCx#deletePost(aPost))}">${Strings.Delete}</a></div>
 <% } %>

 <div class="posted">${Strings.PostedOn.formatMessage({aPost.Posted})}</div>
