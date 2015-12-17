# draftkings-data-scraper
scrapes player data and salary from DraftKings and stores data into an sqlite3 database for analysis

### the database schema

#### PLAYERS table
| pid  | last_name | first_name | pos | proj_fpts | proj_sal | as_of_date |
| ---- | --------- | ---------- | --- | --------- | -------- | ---------- |
| 3100 | Bryant    | Kobe       | SG  | 29.1      | 6100.0   | 1450322398 |

as_of_date is the timestamp at which the scrape occurred

#### GAME_STATS table
| pid  | date | opp | mins | fpts | salary |
| ---- | ---- | ----| ---- | ---- | ------ |
| 3100 |12/15 | Mil | 27.0 | 35.25| 6000.0 |



## prerequisites

* nodejs installed
* sqlite3 and sqlite3 command line installed

## how to use

```bash
# install required node packages
npm install
# initialize sqlite3 database
sqlite3 dk.db

# SQLite version 3.9.2 2015-11-02 18:31:45
# Enter ".help" for usage hints.
sqlite> CREATE TABLE PLAYERS (pid INTEGER, last_name TEXT, first_name TEXT, pos TEXT, proj_fpts REAL, proj_sal REAL, as_of_date NUMERIC);
sqlite>
sqlite> CREATE TABLE GAME_STATS (pid INTEGER, date TEXT, opp TEXT, mins REAL, fpts REAL, salary REAL);

node scrape.js
```
