#!/bin/sh

psql -Upostgres < movies.sql
psql -Upostgres movies_db
