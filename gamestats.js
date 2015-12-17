var jsdom = require("jsdom")
var https = require('https')

// var pid = 395388
// var scheduleId = 3991566

var getGameStats = function(pid, scheduleId, eachCallback, endCallback) {
	var options3 = {
	    host: 'www.draftkings.com',
	    port: 443,
	    method: 'GET',
	    path: '/player/card?id=' + pid + '&scheduleId=' + scheduleId + '&contestTypeId=5&showdraft=1'
	}

	var time = Math.floor(new Date() / 1000)
	console.log(time + ': playerCardCall:' + options3.path)

	var req3 = https.request(options3, function(res3) {
	    var data3 = ''
	    res3.on('data', function(chunk) {
	        data3 += chunk
	    })

	    res3.on('end', function() {
	        var str = data3
	        // console.log('player:' + str)

			jsdom.env(str, ['http://code.jquery.com/jquery.js'], function (err, window) {

		        var categories = {}

			    window.$(".gamelog tbody tr").each(function(index, element) {
			        // console.log(index + ':' + window.$(element).text().trim() + "|")
			        
			        var gameStat = {}
			        // {date: '11/12', opp: '@BOS', mins: 34, fpts: 123, salary: 10200}
					gameStat.PID = pid

			        window.$("td", element).each(function(index2, element2) {
			        	var elementStr = window.$(element2).text().trim()
			        	// console.log('td:' + index2 + ':' + elementStr)
			        	if (index == 0) {
			        		categories[index2] = elementStr
			        	} else {
			        		if (categories[index2] == 'SALARY') {
			        			var salary = Number(elementStr.replace(/[^0-9\.]+/g,""))
			        			gameStat[categories[index2]] = salary
			        		} else if (categories[index2] == 'MIN' || categories[index2] == 'FPTS') {
			        			var number = Number(elementStr)
			        			gameStat[categories[index2]] = number
			        		// } else if (categories[index2] == 'DATE') {
			        			// var dateStr = elementStr + '/' + new Date().getFullYear()
			        			// var date = new Date(dateStr)
			        			// gameStat[categories[index2]] = dateStr
			        		} else {
			        			gameStat[categories[index2]] = elementStr	
			        		}
			        	}
			        })

			        if (index == 0) {
						// var json = JSON.stringify(categories)
			    		// console.log('categories:' + json)
			        } else {
			        	var json2 = JSON.stringify(gameStat)
			        	console.log('gameStat:' + json2)
			        	// gameStats[index - 1] = {}
			        	eachCallback(index - 1, gameStat)
			        }

			    })
			    
			    endCallback()
			})
	    })
	})

	req3.on('error', function(e) {
	    console.log('problem with request: ' + e.message);
	})

	req3.end()
}

module.exports = getGameStats

