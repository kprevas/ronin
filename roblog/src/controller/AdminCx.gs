package controller

uses db.roblog.Post
uses db.roblog.BlogInfo
uses db.roblog.User
uses ronin.RoninController
uses ronin.NoAuth

class AdminCx extends RoninController {

  function newPost() {
    view.Layout.render(Writer, "New post", \ -> view.EditPost.render(Writer, new Post()))
  }

  function editPost(post : Post) {
    view.Layout.render(Writer, "Edit post", \ -> view.EditPost.render(Writer, post))
  }

  function deletePost(post : Post) {
    post.delete()
    redirect(PostCx#recent(0))
  }

  function savePost(post : Post) {
    if(post._New) {
      post.Posted = new java.sql.Timestamp(java.lang.System.currentTimeMillis())
    }
    post.update()
    redirect(PostCx#viewPost(post))
  }

  function setup() {
    var blogInfos = BlogInfo.find(null)
    var blogInfo : BlogInfo
    if(blogInfos.Empty) {
      blogInfo = new BlogInfo()
    } else {
      blogInfo = blogInfos[0]
    }
    view.Layout.render(Writer, "Setup", \ -> view.Setup.render(Writer, blogInfo))
  }

  function editInfo(blogInfo : BlogInfo) {
    blogInfo.update()
    redirect(#setup())
  }

  @NoAuth
  function login() {
    view.Layout.render(Writer, "Login", \ -> view.Login.render(Writer))
  }

  @NoAuth
  function doLogin(name : String, pass : String) {
    if(AuthManager.login(name, pass)) {
      postLoginRedirect(PostCx#recent(0))
    } else {
      redirect(#login())
    }
  }

  function logout() {
    AuthManager.logout()
    redirect(#login())
  }

  function createUser(name : String, pass : String) {
    var hashAndSalt = AuthManager.getPasswordHashAndSalt(pass)
    var user = new User() {:Name = name, :Hash = hashAndSalt.First, :Salt = hashAndSalt.Second}
    user.update()
    redirect(#login())
  }

}
