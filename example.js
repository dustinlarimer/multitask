var mtask = require('./');

var stage1 = function(done){
  console.log('stage 1 is running');
  setTimeout(function(){
    done(1);
  }, 1000);
}

function stage2(result, done){
  console.log('stage 2 is running');
  setTimeout(function(){
    done(result*2);
  }, 2000);
}

// pseudo-chaining techniques
mtask
  .set('stage 1', stage1)
  .set('stage 2', ['stage 1'], stage2)
  .set('stage 3', function(done){
    mtask.run('stage 1').then(done);
  });

mtask.set('report', ['stage 2', 'stage 1'], function(result, done){
  console.log('report task is running');
  console.log(arguments);
  done( result[0] + result[1] );
});

function init(){
  // mtask.run('stage 3').then(function(){
  //   console.log('3 is done', arguments);
  // });

  mtask
    .reset()
    .run(['report', undefined, 'stage 3', 'stage 1', 'stage 2'])
    .then(function(){
      // throw new Error("message");
      console.log('done', arguments);
    })
    .catch(function(err){
      console.log(err);
    });
}

init();
setInterval(init, 5000);
