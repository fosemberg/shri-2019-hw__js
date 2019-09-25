var promiseCounter = 0;
noop = function() {};

Promise2 = function (executor) {
  var STATUS = {
    PENDING: 0,
    RESOLVED: 1,
    REJECTED: 2
  };

  this.executer = executor;

  this.status = STATUS.PENDING;
  this.value = undefined;
  this.handled = false;
  this.onResolved = noop;
  this.onReject = noop;
  this.onHandle = noop;

  // for debug
  this.id = ++promiseCounter;

  this.interval = undefined;
  this.then = function (onFulfilled, onRejected) {
    var pr = new this.constructor(noop);
    this.onHandle = function () {
      if (this.status === STATUS.RESOLVED) {
        var onFulfilledValue = onFulfilled(this.value);
        if (this.constructor.prototype.isPrototypeOf(onFulfilledValue)) {
          onFulfilledValue.onResolved = pr.resolve;
        } else {
          pr.resolve();
        }
      } else if (this.status === STATUS.REJECTED) {
        var onRejectedValue = onRejected(this.value);
        if (this.constructor.prototype.isPrototypeOf(onRejectedValue)) {
          onRejectedValue.onReject = pr.reject;
        } else {
          pr.reject();
        }
      }
    }.bind(this);
    return pr;
  }.bind(this);

  this.resolve = function (value) {
    this.status = STATUS.RESOLVED;
    this.onResolved();

    this.value = value;
    this.handled = true;
    this.onHandle();
  }.bind(this);
  this.reject = function (value) {
    this.status = STATUS.REJECTED;
    this.onReject();

    this.value = value;
    this.handled = true;
    this.onHandle();
  }.bind(this);

  this.executer(this.resolve, this.reject);
};

Promise2.resolve = function (value) {
  return new Promise2(function (resolve, reject) {
    resolve(value)
  })
};
Promise2.reject = function (value) {
  return new Promise2(function (resolve, reject) {
    reject(value)
  })
};

var counter = 0;
var log = console.log;

function makePromiseWithPromise(promise, promiseName) {
  return function (message) {
    return function () {
      return new promise(function (resolve, reject) {
        setTimeout(function () {
          var out = promiseName + ': ' + message + ' :' + ++counter;
          console.log(out);
          resolve(out);
        }, 1000)
      })
    }
  }
}

var makePromise = makePromiseWithPromise(Promise, 'Promise ');
var makePromise2 = makePromiseWithPromise(Promise2, 'Promise2');

// console.log(new Promise(function(some, some) {}));

p1 = makePromise2('p1')();
p2 = p1.then(makePromise2('p2'));
p3 = p2.then(makePromise2('p3'));
p4 = p3
  .then(console.log)
  .then(console.log)
  .then(console.log)
  .then(makePromise2('p4'));

p1 = makePromise('p1')();
p2 = p1.then(makePromise('p2'));
p3 = p2.then(makePromise('p3'));
p4 = p3
  .then(console.log)
  .then(console.log)
  .then(console.log)
  .then(makePromise('p4'));


// p2 = makePromise2()
//     .then(log)
//     .then(log)
//     .then(log);

// p2 = new Promise(function(resolve, reject) {
//     setTimeout(function() {resolve(2)}, 2000);
// });
//
// p3 = p2.then(console.log);
// p3.then(console.log)
// console.log(p3)