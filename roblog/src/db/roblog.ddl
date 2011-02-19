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
    "Hash" VARCHAR(44),
    "Salt" VARCHAR(172)
);
INSERT INTO "User"("id", "Name", "Hash", "Salt") VALUES
(1, 'admin', 'ilPQ0UXsOZMvdpyKmsqlyGdYc9uXzCREqOb7AL1dv2A=', 'ObnNMzW+Ll0LnQP/Hnjb8MsXB8PTaeKKdDPqJvwmtzCQ4EW0FFLsoCqGkInD+rGCKQ42NXFEBSs6TlDQfHuu5xpAT2mX11YhYJv3W8CK5UtMLvYyOg1OzyuSNLsz479wlwmOaZjiketXbPTyQgRMNJIBKk8qHgqLcC08dBVEtT8=');
CREATE TABLE "Comment"(
    "id" BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    "Post_id" BIGINT,
    "Name" VARCHAR(255),
    "Text" TEXT,
    "Posted" TIMESTAMP
);

INSERT INTO "BlogInfo"("id", "Title") VALUES (0, 'RoBlog');