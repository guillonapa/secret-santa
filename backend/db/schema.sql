-- schema.sql
-- Since we might run the import many times we'll drop if exists
DROP DATABASE IF EXISTS "santa-app-sandbox";

CREATE DATABASE "santa-app-sandbox";

-- Make sure we're using our `santa-app-sandbox` database
\c "santa-app-sandbox";

-- We can create our user table
CREATE TABLE IF NOT EXISTS people (
  name VARCHAR,
  email VARCHAR,
  event_key VARCHAR,
  personal_key VARCHAR PRIMARY KEY,
  match VARCHAR
);

-- We can create our post table
CREATE TABLE IF NOT EXISTS events (
  key VARCHAR PRIMARY KEY,
  name VARCHAR,
  date DATE DEFAULT CURRENT_DATE
);