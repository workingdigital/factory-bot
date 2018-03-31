var md5 = require('md5');

module.exports.mysql_init = function (config) {
    var mysql = require('mysql');
    var mysql_init = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database
    });
    return mysql_init;
}

module.exports.showLevelCommand = function (message, config) {
    var author = message.author;
    message.delete(10);
    var mysql_init = this.mysql_init(config.ENV.MYSQL);
    mysql_init.connect(function(err) {
    if (err) throw err;
        mysql_init.query("SELECT * FROM levels WHERE owner = '" + md5(author['id']) + "'", function (err, result, fields) {
            if (err) throw err;
            var level = result[0].level;
            var messageSend = config.levelManager.backmessages.showlevelpv.start + " " + author.username + " " + config.levelManager.backmessages.showlevelpv.center + " " + level + " " + config.levelManager.backmessages.showlevelpv.end;
            message.author.sendMessage(messageSend);
        });
    });
}


module.exports.addLevel = function (author, level, config) {
    var mysql_init = this.mysql_init(config.ENV.MYSQL);
    mysql_init.connect(function(err) {
    if (err) throw err;
    var sql = "UPDATE levels SET level = '"+level+"' WHERE owner = '" + author + "'";
        mysql_init.query(sql, function (err, result) {
            if (err) throw err;
            console.log(author + " has been updated to the level "+level);
        });
    });
}


module.exports.createProfil = function (author, config) {
    var mysql_init = this.mysql_init(config.ENV.MYSQL);
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    if (mm < 10) { mm = "0"+mm; }
    var yyyy = today.getFullYear();
    var date = yyyy+"-"+mm+"-"+dd;
    mysql_init.connect(function(err) {
    if (err) throw err;
        console.log("Connected!");
        var sql = "INSERT INTO levels (id, owner, level, firstdate) VALUES (NULL, '" + author + "', '1', '" + date + "')";
        mysql_init.query(sql, function (err, result) {
            if (err) throw err;
            console.log("New user inserted -> "+author);
        });
    });
}

module.exports.displayMessageForLevelUp = function (message, config, level, firstdate) {
    var showTheLevelUp = config.levelManager.showTheLevelUp;
    if (showTheLevelUp) {
        var backmessages = config.levelManager.backmessages;
        var STLW = config.levelManager.showTheLevelUpWhen;
        level = parseInt(level);
        if (level%STLW === 0) {
            message.reply(backmessages.uplevel.start + " " + level + " " + backmessages.uplevel.center + " " + firstdate + " " + backmessages.uplevel.end);
        }
    }
}


module.exports.exec = function (message, config) {
    var backmessages = config.levelManager.backmessages;
    var author = message.author;
    var mysql_init = this.mysql_init(config.ENV.MYSQL);
    mysql_init.connect(function(err) {
    if (err) throw err;
        mysql_init.query("SELECT * FROM levels", function (err, result, fields) {
            if (err) throw err;
            var resultVerif = false;
            for(var i= 0; i < result.length; i++) {
                if (result[i].owner == md5(author['id'])) {
                    resultVerif = true;
                    usr = result[i];
                }
            }
            if (resultVerif) {
                var level = usr.level+1;
                exports.addLevel(md5(author['id']), level, config);
                var today = new Date(usr.firstdate);
                var dd = today.getDate();
                var mm = today.getMonth()+1; 
                if (mm < 10) { mm = "0"+mm; }
                var yyyy = today.getFullYear();
                var firstdate = dd+"/"+mm+"/"+yyyy;
                
                exports.displayMessageForLevelUp(message, config, level, firstdate);
                
            } else {
                exports.createProfil(md5(author['id']), config);
                message.reply(backmessages.newuser);
                message.author.sendMessage(backmessages.newuserpv);
            }
        });
    });
};