package controller

uses db.roblog.Post
uses db.roblog.BlogInfo
uses db.roblog.User
uses ronin.RoninController

class AdminCx extends RoninController {

  static function newPost() {
    view.Layout.render(Writer, "New post", \ -> view.EditPost.render(Writer, new Post()))
  }

  static function editPost(post : Post) {
    view.Layout.render(Writer, "Edit post", \ -> view.EditPost.render(Writer, post))
  }

  static function deletePost(post : Post) {
    if(AuthManager.CurrentUserName == "admin") {
      post.delete()
    }
    redirect(PostCx#recent(0))
  }

  static function savePost(post : Post) {
    if(AuthManager.CurrentUserName == "admin") {
      if(post._New) {
        post.Posted = new java.sql.Timestamp(java.lang.System.currentTimeMillis())
      }
      post.update()
    }
    redirect(PostCx#viewPost(post))
  }

  static function setup() {
    var blogInfos = BlogInfo.find(null)
    var blogInfo : BlogInfo
    if(blogInfos.Empty) {
      blogInfo = new BlogInfo()
    } else {
      blogInfo = blogInfos[0]
    }
    view.Layout.render(Writer, "Setup", \ -> view.Setup.render(Writer, blogInfo))
  }

  static function editInfo(blogInfo : BlogInfo) {
    if(AuthManager.CurrentUserName == "admin") {
      blogInfo.update()
    }
    redirect(#setup())
  }

  static function login() {
    view.Layout.render(Writer, "Login", \ -> view.Login.render(Writer))
  }

  static function doLogin(name : String, pass : String) {
    if(AuthManager.login(name, pass)) {
      redirect(PostCx#recent(0))
    } else {
      redirect(#login())
    }
  }

  static function logout() {
    AuthManager.logout()
    redirect(#login())
  }

  static function createUser(name : String, pass : String) {
    var hashAndSalt = AuthManager.getPasswordHashAndSalt(pass)
    var user = new User() {:Name = name, :Hash = hashAndSalt.First, :Salt = hashAndSalt.Second}
    user.update()
    redirect(#login())
  }

}
