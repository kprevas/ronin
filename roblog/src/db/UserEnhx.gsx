package db

uses db.roblog.User
uses controller.OpenID

enhancement UserEnhx : User {

  static function getOrCreateByOpenID(identity : String, email : String, idProvider : String) : User {
    var idToUse : String = null
    if(idProvider == OpenID.GOOGLE) {
      idToUse = email
    } else if(idProvider.startsWith(OpenID.VERISIGN.substring(0, OpenID.VERISIGN.indexOf("{username}")))) {
      idToUse = identity
    } else {
      return null
    }
    var byEmail = User.selectLike(new User(){:Name = idToUse})
    if(byEmail?.HasElements) {
      return byEmail.first()
    } else {
      var newUser = new User() {:Name = idToUse}
      newUser.update()
      return newUser
    }
  }

}