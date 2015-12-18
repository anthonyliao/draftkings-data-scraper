var getGameStats = require('./gamestats')

var suspend = require('suspend')

var fs = require('fs')
var file = 'dk.db'
var exists = fs.existsSync(file)

var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(file)

var https = require('https')

db.on('trace', function(sql) {
    console.log('sql:' + sql)
})

var options = {
    host: 'www.draftkings.com',
    port: 443,
    method: 'POST',
    path: '/lineup/getupcomingcontestinfo/',
    headers: {
        'Content-Length': '0'
    }
}

var req = https.request(options, function(res) {
  // console.log('STATUS: ' + res.statusCode)
  // console.log('HEADERS: ' + JSON.stringify(res.headers))
  // res.setEncoding('utf8')
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk)
    var json = JSON.parse(chunk)
    console.log('games.length:' + json.length)

    var selectedGame = null
    for (var index in json) {
        // console.log('game:' + json[index])
        var game = json[index]
        if (game.SportId == 4) {
            // console.log('DraftGroupId:' + game.DraftGroupId)
            if (selectedGame == null) {
                selectedGame = game
            }

            if (selectedGame.GameCount < game.GameCount) {
                selectedGame = game
            }
        }
    }

    if (selectedGame == null) {
        console.log('couldnt find a valid game')
    } else {
        console.log('selectedGame:' + selectedGame.DraftGroupId)

        var options2 = {
            host: 'www.draftkings.com',
            port: 443,
            method: 'GET',
            path: '/lineup/getavailableplayers?draftGroupId=' + selectedGame.DraftGroupId
        }

        var req2 = https.request(options2, function(res2) {
            var data = ''
            res2.on('data', function(chunk) {
                data += chunk
            })

            res2.on('end', function() {
                var json = JSON.parse(data)
                console.log('playerList.length:' + json.playerList.length)
                var playerList = json.playerList

                db.serialize(function() {
                    
                    suspend(function* () {
                    
                        var as_of_date = Math.floor(new Date() / 1000)

                        for (var playerIndex in playerList) {
                            var pid = playerList[playerIndex].pid
                            var scheduleId = playerList[playerIndex].tsid
                            var last_name = playerList[playerIndex].ln
                            var first_name = playerList[playerIndex].fn
                            var pos = playerList[playerIndex].pn
                            var proj_fpts = playerList[playerIndex].ppg
                            var proj_sal = playerList[playerIndex].s

                            console.log('last_name:' + playerList[playerIndex].ln + ', first_name:' + playerList[playerIndex].fn)

                            var stmt = db.prepare('INSERT INTO PLAYERS VALUES (?, ?, ?, ?, ?, ?, ?)')

                            stmt.run(pid, last_name, first_name, pos, proj_fpts, proj_sal, as_of_date)

                            stmt.finalize()

                            console.log('fetching last_name:' + last_name + ', first_name:' + first_name)
                            yield setTimeout(suspend.resume(), 2000)
                            getGameStats(pid, scheduleId, function(index, gameStat) {

                                // var json = JSON.stringify(gameStat)
                                // console.log('index:' + index + ', gameStat:' + json)

                                var getStmt = db.prepare('SELECT 1 FROM GAME_STATS WHERE pid = ? AND date = ?')

                                getStmt.get(gameStat.PID, gameStat.DATE, function(err, row) {
                                    if (row === undefined) {
                                        var stmt = db.prepare('INSERT INTO GAME_STATS VALUES (?, ?, ?, ?, ?, ?)')
                                        stmt.run(gameStat.PID, gameStat.DATE, gameStat.OPP, gameStat.MIN, gameStat.FPTS, gameStat.SALARY)
                                        stmt.finalize()
                                    }
                                })
                                
                                
                            }, function() {
                            })
                        } 

                    })()
                }) 
            })
        })

        req2.end()
    }
  })
})

req.end()

req.on('error', function(e) {
  console.error(e);
})
