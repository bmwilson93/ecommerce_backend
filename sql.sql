-- Run to create the tables for the e-commerce Codecademy Portfolio Project

-- My tables
CREATE TABLE users (
  id int PRIMARY KEY,
  email varchar(128) NOT NULL UNIQUE,
  password varchar(64) NOT NULL,
  first_name varchar(64) NOT NULL,
  last_name varchar(64) NOT NULL
);

CREATE TABLE products (
  id int PRIMARY KEY,
  name varchar(128) NOT NULL,
  description varchar(288) NOT NULL,
  product_img text,
  price money NOT NULL
);

CREATE TABLE orders (
  id int PRIMARY KEY,
  user_id integer NOT NULL,
  order_total money NOT NULL,
  created_at timestamp NOT NULL,
  order_number varchar(16) NOT NULL,
  items json NOT NULL,
  payment_id varchar(50)
);

-- Table to store the session data from express-session, connect-pg-simple
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");