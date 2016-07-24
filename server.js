var mongoose = require('mongoose');
var Character = require('./models/character');

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


mongoose.connect(config.database);
mongoose.connection on('error', function(){
  console.info('Error: Could not connect to MongoDB.voted - a boolean for identifying which characters have already been voted. Previously, people were abusing the website by voting for the same character multiple times in a row. But now, when querying for two characters, only those characters that have not been voted will be fetched. Even if someone were to hit the API directly, a vote will not count for already voted characters.');
});

/**
 * GET /api/characters
 * Returns 2 random characters of the same gender that have not been voted yet.
 */

 app.get('/api/characters', function(req,res,next){
    var randomGender = _.sample(choices);
    var choices = [ Female , Male ];

    //use the Character object find method to find a random gender who hasnt beeen
    //voted on yet. Limit only 2.

    Character.find({ random :{$near:[Math.random(),0]}})
    .where('voted',false)
    .where('gender',randomGender)
    .limit(2)
    .exec(function(err,characters){
      if(err) return next (err);

      //create the next conditional
      if(characters.length === 2){
        return res.send(characters);
      }


      //If we don't get back 2 characters for either Male or Female gender
      // create another query with the oppositeGender.
      var oppositeGender = _.first(_.without(choices, randomGender));


      // create and use the Character update method.
      Character.update({},{ $set: {voted:false} },{multi:true}, function(err){
        if(err) return next(err);
        res.send([]);
      });
    });
 });

 /**
  * PUT /api/characters
  * Update winning and losing count for both characters.
  */
 app.put('/api/characters', function(req, res, next) {
   var winner = req.body.winner;
   var loser = req.body.loser;

   if (!winner || !loser) {
     return res.status(400).send({ message: 'Voting requires two characters.' });
   }

   if (winner === loser) {
     return res.status(400).send({ message: 'Cannot vote for and against the same character.' });
   }

   async.parallel([
       function(callback) {
         Character.findOne({ characterId: winner }, function(err, winner) {
           callback(err, winner);
         });
       },
       function(callback) {
         Character.findOne({ characterId: loser }, function(err, loser) {
           callback(err, loser);
         });
       }
     ],
     function(err, results) {
       if (err) return next(err);

       var winner = results[0];
       var loser = results[1];

       if (!winner || !loser) {
         return res.status(404).send({ message: 'One of the characters no longer exists.' });
       }

       if (winner.voted || loser.voted) {
         return res.status(200).end();
       }

       async.parallel([
         function(callback) {
           winner.wins++;
           winner.voted = true;
           winner.random = [Math.random(), 0];
           winner.save(function(err) {
             callback(err);
           });
         },
         function(callback) {
           loser.losses++;
           loser.voted = true;
           loser.random = [Math.random(), 0];
           loser.save(function(err) {
             callback(err);
           });
         }
       ], function(err) {
         if (err) return next(err);
         res.status(200).end();
       });
     });
 });
 /***
 * POST /api/report
 * Reports a character. Character is removed after 4 reports.
 *
 *
 */
 app.post('/api/report', function(req, res, next) {
  var characterId = req.body.characterId;

  Character.findOne({ characterId: characterId }, function(err, character) {
    if (err) return next(err);

    if (!character) {
      return res.status(404).send({ message: 'Character not found.' });
    }

    character.reports++;

    if (character.reports > 4) {
      character.remove();
      return res.send({ message: character.name + ' has been deleted.' });
    }

    character.save(function(err) {
      if (err) return next(err);
      res.send({ message: character.name + ' has been reported.' });
    });
  });
});
/**
 * GET /api/stats
 * Returns characters statistics.
 */
app.get('/api/stats', function(req, res, next) {
  async.parallel([
      function(callback) {
        Character.count({}, function(err, count) {
          callback(err, count);
        });
      },
      function(callback) {
        Character.count({ race: 'Amarr' }, function(err, amarrCount) {
          callback(err, amarrCount);
        });
      },
      function(callback) {
        Character.count({ race: 'Caldari' }, function(err, caldariCount) {
          callback(err, caldariCount);
        });
      },
      function(callback) {
        Character.count({ race: 'Gallente' }, function(err, gallenteCount) {
          callback(err, gallenteCount);
        });
      },
      function(callback) {
        Character.count({ race: 'Minmatar' }, function(err, minmatarCount) {
          callback(err, minmatarCount);
        });
      },
      function(callback) {
        Character.count({ gender: 'Male' }, function(err, maleCount) {
          callback(err, maleCount);
        });
      },
      function(callback) {
        Character.count({ gender: 'Female' }, function(err, femaleCount) {
          callback(err, femaleCount);
        });
      },
      function(callback) {
        Character.aggregate({ $group: { _id: null, total: { $sum: '$wins' } } }, function(err, totalVotes) {
            var total = totalVotes.length ? totalVotes[0].total : 0;
            callback(err, total);
          }
        );
      },
      function(callback) {
        Character
          .find()
          .sort('-wins')
          .limit(100)
          .select('race')
          .exec(function(err, characters) {
            if (err) return next(err);

            var raceCount = _.countBy(characters, function(character) { return character.race; });
            var max = _.max(raceCount, function(race) { return race });
            var inverted = _.invert(raceCount);
            var topRace = inverted[max];
            var topCount = raceCount[topRace];

            callback(err, { race: topRace, count: topCount });
          });
      },
      function(callback) {
        Character
          .find()
          .sort('-wins')
          .limit(100)
          .select('bloodline')
          .exec(function(err, characters) {
            if (err) return next(err);

            var bloodlineCount = _.countBy(characters, function(character) { return character.bloodline; });
            var max = _.max(bloodlineCount, function(bloodline) { return bloodline });
            var inverted = _.invert(bloodlineCount);
            var topBloodline = inverted[max];
            var topCount = bloodlineCount[topBloodline];

            callback(err, { bloodline: topBloodline, count: topCount });
          });
      }
    ],
    function(err, results) {
      if (err) return next(err);

      res.send({
        totalCount: results[0],
        amarrCount: results[1],
        caldariCount: results[2],
        gallenteCount: results[3],
        minmatarCount: results[4],
        maleCount: results[5],
        femaleCount: results[6],
        totalVotes: results[7],
        leadingRace: results[8],
        leadingBloodline: results[9]
      });
    });
});

    }

  })



app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
