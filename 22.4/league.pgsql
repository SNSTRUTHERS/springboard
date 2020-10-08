-- Design a schema for a simple sports league. Your schema should keep track of
--  - All of the teams in the league
--  - All of the goals scored by every player for each game
--  - All of the players in the league and their corresponding teams
--  - All of the referees who have been part of each game
--  - All of the matches played between teams
--  - All of the start and end dates for season that a league has
--  - The standings/rankings of each team in the league (This doesn’t have to be its own table
--      if the data can be captured somehow).

DROP DATABASE IF EXISTS league;
CREATE DATABASE league;
\c league;

----------------------------------------------------------------------------------------------------

-- list of teams
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- list of registered players
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    team_id INTEGER REFERENCES teams ON DELETE SET NULL
);

-- list of registered referees
CREATE TABLE referees (
    id SERIAL PRIMARY KEY,
    first_name TEXT,
    last_name TEXT
);

-- list of seasons
CREATE TABLE seasons (
    id SERIAL PRIMARY KEY,
    start_date DATE,
    end_date DATE
);
CREATE INDEX season_dates ON seasons (start_date, end_date);

-- list of matches
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    team1_id INTEGER REFERENCES teams ON DELETE SET NULL,   -- team1's ID
    team1_score INTEGER NOT NULL,                           --   and score
    team2_id INTEGER REFERENCES teams ON DELETE SET NULL,   -- team2's ID
    team2_score INTEGER NOT NULL,                           --   and score
    referee_id INTEGER REFERENCES referees,                 -- the match's referee
    date DATE                                               -- when the match took place
);
