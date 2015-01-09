# multitask

## How it works

### Create tasks

`.set` defines a task and its optional dependencies. Tasks and task dependencies are wrapped with [Bluebird](https://github.com/petkaantonov/bluebird) promises. Each task will be called with a last argument (explained below) containing a "done" function that completes the task and optionally returns a value.

```javascript
multitask
  .set('first task', function(done){
    // do some asynchronous work and call done()
    done({ response: "tada!" });
  })
  .set('next task', ['list', 'of', 'dependent', 'tasks'], function(res, done){
    // notice this task depends on others ^
    // insert an argument to get an array of values returned by them ^ ...
    done({ task_count: res.length });
  })
  .set('task three', ['first task', 'next task'], function(done){
    // ... or omit that extra argument if the results of dependent tasks are not needed
    // the -last- argument will always be a `done` function
  });

```

### Run tasks and handle responses

`.run` returns a [Bluebird](https://github.com/petkaantonov/bluebird) promise, which exposes a `then` method (for handling results) and a `catch` method (for catching errors).

```javascript
multitask
  .run(['list', 'of', 'tasks'])
  .then(function(res){
    /* res == array containing results of all tasks */
  })
  .catch(function(err){
    /* err == any errors thrown by tasks */
  });
```

### Reset before re-running

If you're running tasks with a cron or interval, `.reset` will clear out previous results before re-running. This can be useful when hitting an API for time-sensitive data.

```javascript
multitask
  .reset()
  .run(['first', 'next']);
```

## Example implementation

```javascript
var tasks = require('./');

tasks.set('stage 1', function(done){
  setTimeout(function(){
    done(1);
  }, 1000);
});

tasks.set('stage 2', ['stage 1'], function(result, done){
  // receive prior result by providing argument ^
  setTimeout(function(){
    done(result * 2);
  }, 2000);
});

mtask.set('report', ['stage 2', 'stage 1'], function(result, done){
  done( result[0] + result[1] );
});

function init(){
  mtask
    .reset()
    .run(['report', undefined, 'also undefined', 'stage 1', 'stage 2'])
    .then(function(result){
      console.log('done', result);
    })
    .catch(function(err){
      console.log('err', err);
    });
}

init();
setInterval(init, 5000);
```

Output

1. 'stage 1' task begins (1000ms pause)
2. 'stage 2' task begins (2000ms pause)
3. 'report' task begins
4. runner exits with arguments `{ '0': [ 2, 1 ], '1': [Function] }`
5. runner logs 'done' with arguments `{ '0': [ 3, undefined, 'also undefined', 1, 2 ] }`
