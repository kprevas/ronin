--========================================
--  Initial DB Schema
--========================================
CREATE USER IF NOT EXISTS SA SALT '12bd38540d6d1b6d' HASH 'badd644249ad1cdbb9efd2717b285af20c7040ea835090cae2c65b1e11785ded' ADMIN;
CREATE TABLE "BlogInfo"(
    "id" BIGINT NOT NULL PRIMARY KEY,
    "Title" VARCHAR(255)
);
CREATE TABLE "Post"(
    "id" BIGINT NOT NULL PRIMARY KEY,
    "Title" TEXT,
    "Body" TEXT,
    "Posted" TIMESTAMP
);
CREATE TABLE "User"(
    "id" BIGINT NOT NULL PRIMARY KEY,
    "Name" VARCHAR(64),
    "Hash" VARCHAR(128),
    "Salt" VARCHAR(32)
);
INSERT INTO "User"("id", "Name", "Hash", "Salt") VALUES
(1, 'admin', STRINGDECODE('\u00b5\u00ea\u00d4\u00cc\ufffd\u00de\u0153O\u00a3\u00c4\u00c5\u00f2\u00b8\u00bb\u0161\u00ff'), STRINGDECODE('\u00c1\u0013\u0013cZ\u00ecE\u00dfp\u00bf]D\u00f9J\u00c9\u00e8\u00f3q\u00e9wvR\u00b6r\u201d\u0014\u00f4\u001ax\u00e3/l'));
CREATE TABLE "Comment"(
    "id" BIGINT NOT NULL PRIMARY KEY,
    "Post_id" BIGINT,
    "Name" VARCHAR(255),
    "Text" TEXT,
    "Posted" TIMESTAMP
);

INSERT INTO "BlogInfo"("id", "Title") VALUES (0, 'RoBlog');