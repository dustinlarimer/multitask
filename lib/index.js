var multitask = {
  _tasks: {}
};

multitask.set = function(name){
  var args = Array.prototype.slice.call(arguments);

  // Requires two or more arguments
  if (args.length < 2) return;

  // #set(name, null) removes task
  if (args[1] === null) {
    multitask._tasks[name] = void 0;
    return;
  }

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
multitask.run = function(){};

module.exports = multitask;
