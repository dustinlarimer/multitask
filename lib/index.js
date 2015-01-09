var Promise = require('bluebird');

var multitask = {
  _tasks: {}
};

// Return a single task
multitask.get = function(name){
  return name ? multitask._tasks[name] : multitask._tasks;
};

// Run task(s) and return a promise
multitask.run = function(name){
  if (!arguments.length) return;
  if ( name instanceof Array ) {
    return runManyTasks(name);
  }
  else if ( multitask.get(name) ) {
    return runSingleTask(name);
  }
};

function runManyTasks(names){
  var promises = [];
  names.forEach(function(taskName){
    if (taskName && multitask.get(taskName)) {
      // running a single task returns a promise
      promises.push( runSingleTask(taskName) );
    }
    else {
      // pass it along, preserve the signature
      promises.push( taskName );
    }
  });
  return Promise.all(promises);
}

function runSingleTask(name){
  var task = multitask.get(name);
  if (!task.promise) {
    if (task.required && task.required.length) {
      task.promise = runManyTasks(task.required).then(start);
    }
    else {
      task.promise = start();
    }
  }
  function start(){
    var args = Array.prototype.slice.call(arguments);
    return new Promise(function(done){
      // inject prior response when an argument is provided for it
      args = (task.callback.length > 1) ? args.concat(done) : [done];
      task.callback.apply(null, args.concat(done));
    });
  }
  return task.promise;
}


// Return reference to multitask
// ------------------------------

multitask.del = function(name){
  if (!arguments.length) return;
  multitask._tasks[name] = void 0;
  return multitask;
};

multitask.reset = function(){
  for (var name in multitask._tasks) {
    multitask._tasks[name].promise = void 0;
  }
  return multitask;
};

multitask.set = function(name){
  var args = Array.prototype.slice.call(arguments);

  // Requires two or more arguments
  if (args.length < 2) return;

  // create task
  multitask._tasks[name] = {};

  if (args[1] instanceof Array && typeof args[2] === 'function') {
    multitask._tasks[name].required = args[1];
    multitask._tasks[name].callback = args[2];
  }
  else {
    multitask._tasks[name].callback = args[1];
  }
  // console.log(multitask._tasks[name].callback.length);
  return multitask;
};

module.exports = multitask;
