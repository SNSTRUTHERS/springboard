-- Design a schema for Craigslist! Your schema should keep track of the following

--  - The region of the craigslist post (San Francisco, Atlanta, Seattle, etc)
--  - Users and preferred region
--  - Posts: contains title, text, the user who has posted, the location of the posting, the
--      region of the posting
--  - Categories that each post belongs to

DROP DATABASE IF EXISTS craigslist;
CREATE DATABASE craigslist;
\c craigslist;

----------------------------------------------------------------------------------------------------

CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL      -- region name
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,                      -- username
    preferred_region_id INTEGER REFERENCES regions  -- preferred region
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users ON DELETE SET NULL,   -- the user that made the post
    location_id INTEGER REFERENCES regions,                         -- region the post is made in
    title VARCHAR(128) NOT NULL,                                    -- the post's title
    description TEXT                                                -- the post's description
);

CREATE TABLE post_category_pairings (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories,          -- category ID
    post_id INTEGER REFERENCES posts ON DELETE CASCADE  -- post belonging to the given category
);
