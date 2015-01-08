var Promise = require('bluebird');

var multitask = {
  _tasks: {}
};

multitask.run = function(name){
  var promise;
  if (!arguments.length) return;
  if ( name instanceof Array ) {
    promise = runManyTasks(name);
  }
  else if ( multitask.get(name) ) {
    promise = runSingleTask(name);
  }
  return promise.then(function(res){
    var tasks = multitask.tasks();
    for (var key in tasks) {
      tasks[key].promise = undefined;
      try {
        delete tasks[key].promise;
      } catch(e) {};
    }
    return res;
  })
};

function runManyTasks(names){
  var promises = [];
  names.forEach(function(taskName){
    if (taskName && multitask.get(taskName)) {
      // running a single task returns a promise
      promises.push( runSingleTask(taskName) );
    }
    else {
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
      task.callback.apply(null, args.concat(done));
    });
  }

  return task.promise;
}


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
};

multitask.get = function(name){
  return name ? multitask._tasks[name] : multitask._tasks;
};

// multitask.del = function(name){
//   multitask._tasks[name] = void 0;
//   try {
//     delete multitask._tasks[name];
//   } catch(e) {}
//   return;
// };

multitask.tasks = function(){
  return multitask._tasks || [];
};

module.exports = multitask;
