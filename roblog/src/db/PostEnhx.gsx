package db

uses db.roblog.Post
uses java.sql.Timestamp

enhancement PostEnhx : Post {

  property get PostedSQL() : String {
    return new Timestamp(this.Posted.Time).toString()
  }

}