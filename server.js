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

      // create and use the Character update method.
      Character.update({})

    })
 })



app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
