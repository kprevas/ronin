--========================================
--  Initial DB Schema
--========================================
CREATE USER IF NOT EXISTS SA SALT '12bd38540d6d1b6d' HASH 'badd644249ad1cdbb9efd2717b285af20c7040ea835090cae2c65b1e11785ded' ADMIN;
CREATE TABLE "BlogInfo"(
    "id" BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    "Title" VARCHAR(255)
);
CREATE TABLE "Post"(
    "id" BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    "Title" TEXT,
    "Body" TEXT,
    "Posted" TIMESTAMP
);
CREATE TABLE "User"(
    "id" BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    "Name" VARCHAR(64),
    "Hash" VARCHAR(128),
    "Salt" VARCHAR(32)
);
INSERT INTO "User"("id", "Name", "Hash", "Salt") VALUES
(1, 'admin', STRINGDECODE('\u02dat\u02dc''w\u00f42\u2030\u0011\u00c3''f\u00f4r\u00bf\u00ec'), STRINGDECODE('\u00f8)\u201d\u00ce6\u00c4\u00c4?aMUZ\u00ec)\u00d1|:\u2022{+6\u0014mm@\u03a9A\u00ed\u00e2\u2122\u2022-'));
CREATE TABLE "Comment"(
    "id" BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    "Post_id" BIGINT,
    "Name" VARCHAR(255),
    "Text" TEXT,
    "Posted" TIMESTAMP
);

INSERT INTO "BlogInfo"("id", "Title") VALUES (0, 'RoBlog');