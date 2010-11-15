package controller

uses db.roblog.Post
uses db.roblog.BlogInfo
uses db.roblog.User
uses ronin.RoninController

class Admin extends RoninController {

  static function newPost() {
    view.Layout.render(writer, session["User"], "New post", \ -> view.EditPost.render(writer, new Post()))
  }

  static function editPost(post : Post) {
    view.Layout.render(writer, session["User"], "Edit post", \ -> view.EditPost.render(writer, post))
  }

  static function deletePost(post : Post) {
    post.delete()
    redirect(\ -> controller.Post.recent(0))
  }

  static function savePost(post : Post) {
    if(post._New) {
      post.Posted = new java.sql.Timestamp(java.lang.System.currentTimeMillis())
    }
    post.update()
    redirect(\ -> controller.Post.viewPost(post))
  }

  static function setup() {
    var blogInfos = BlogInfo.find(null)
    var blogInfo : BlogInfo
    if(blogInfos.Empty) {
      blogInfo = new BlogInfo()
    } else {
      blogInfo = blogInfos[0]
    }
    view.Layout.render(writer, session["User"], "Setup", \ -> view.Setup.render(writer, blogInfo))
  }

  static function editInfo(blogInfo : BlogInfo) {
    blogInfo.update()
    redirect(\ -> setup())
  }

  static function login() {
    view.Layout.render(writer, session["User"], "Login", \ -> view.Login.render(writer))
  }

  static function doLogin(name : String, pass : String) {
    var user = User.find(new User() {:Name = name})[0]
    if(user != null) {
        if(User.Hash == new String(hashPass(pass.getBytes(), User.Salt.getBytes()))) {
            session["User"] = User.Name
            redirect(\ -> controller.Post.recent(0))
            return
        }
    }
    redirect(\ -> login())
  }

  static function logout() {
    session["User"] = null
    redirect(\ -> login())
  }

  static function createUser(name : String, pass : String) {
    var salt = new byte[32]
    java.security.SecureRandom.getInstance("SHA1PRNG").nextBytes(salt)
    var passBytes = pass.getBytes()
    var user = new User() {:Name = name, :Hash = new String(hashPass(passBytes, salt)), :Salt = new String(salt)}
    user.update()
    redirect(\ -> login())
  }

  static function hashPass(pass : byte[], salt : byte[]) : byte[] {
    var saltedPass = new byte[salt.length + pass.length]
    java.lang.System.arrayCopy(salt, 0, saltedPass, 0, salt.length)
    java.lang.System.arrayCopy(pass, 0, saltedPass, salt.length, pass.length)
    return java.security.MessageDigest.getInstance("MD5").digest(saltedPass)
  }
}
