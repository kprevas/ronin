package db

uses db.roblog.User

enhancement UserEnhx : User {

  static function getOrCreateByEmail(email : String, idProvider : String) : User {
    if(idProvider != "https://www.google.com/accounts/o8/id") {
      return null
    }
    var byEmail = User.find(new User(){:Name = email})
    if(byEmail?.HasElements) {
      return byEmail[0]
    } else {
      var newUser = new User() {:Name = email}
      newUser.update()
      return newUser
    }
  }

}