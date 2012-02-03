package controller

uses java.util.Date

uses org.junit.*
uses ronin.test.*

uses db.roblog.*
uses controller.PostCx

class PostTest extends Assert {

  static var posts : List<Post> = {}

  @BeforeClass static function initSampleData() {
    Post.selectAll().each(\p -> p.delete())
    posts = {
      new Post(){
        :Title = "Post 1",
        :Body = "Post 1 body",
        :Posted = Date.Yesterday
      },
      new Post(){
        :Title = "Post 2",
        :Body = "Post 2 body",
        :Posted = Date.Today
      }
    }
    posts.each(\p -> p.update());
  }

  @Test function testViewPost() {
    var resp = RoninTest.get(PostCx#viewPost(posts[0]))
    assertTrue(resp.WriterBuffer.toString().contains(Post.fromId(posts[0].id).Title))
    assertTrue(resp.WriterBuffer.toString().contains(Post.fromId(posts[0].id).Body))
  }

  @Test function testAll() {
    var resp = RoninTest.get(PostCx#all(0))
    assertTrue(resp.WriterBuffer.toString().contains(Post.fromId(posts[0].id).Title))
    RoninTest.assertResponseContainsLink(resp, PostCx#viewPost(posts[0]))
    assertTrue(resp.WriterBuffer.toString().contains(Post.fromId(posts[1].id).Title))
    RoninTest.assertResponseContainsLink(resp, PostCx#viewPost(posts[1]))
  }

  @Test function testPrev() {
    var resp = RoninTest.get(PostCx#prev(posts[1]))
    RoninTest.assertRedirectTo(resp, PostCx#viewPost(posts[0]))
  }

  @Test function testNext() {
    var resp = RoninTest.get(PostCx#next(posts[0]))
    RoninTest.assertRedirectTo(resp, PostCx#viewPost(posts[1]))
  }

  @Test function testAddComment() {
    var c = new Comment() {
      :Name = "Fred",
      :Text = "Comment text"
    }
    var resp = RoninTest.post("PostCx/addComment", {
      "post" -> {posts[0].id as String},
      "comment.Name" -> {c.Name},
      "comment.Text" -> {c.Text}
    })
    RoninTest.assertRedirectTo(resp, PostCx#viewPost(posts[0]))
    assertEquals(1, Comment.countAll())
  }

}