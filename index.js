var promiseCounter = 0;
var noop = function() {};

Promise2 = function(executor) {
    this.id = ++promiseCounter;
    this.executer = executor;
    var STATUS = {
        PENDING: 0,
        RESOLVED: 1,
        REJECTED: 2
    };

    this.resolve = function(value) {
        return new this.constructor(function(resolve, reject) {resolve(value)})
    };
    this.reject = function (value) {
        return new this.constructor(function(resolve, reject) {reject(value)})
    };
    this.checkIsPending = function() {return this.status === STATUS.PENDING};

    this.interval = undefined;
    this.then = function(onFulfilled, onRejected) {
        var pr = new this.constructor(noop);
        this.interval = setInterval(function() {
            if (this.status !== STATUS.PENDING) {
                clearInterval(this.interval);
                if (this.status === STATUS.RESOLVED) {
                    console.log('onFulfilled');
                    var onFulfilledValue = onFulfilled(this.value);
                    if (this.constructor.prototype.isPrototypeOf(onFulfilledValue)) {
                        onFulfilledValue.onResolved = function () {
                            pr.status = STATUS.RESOLVED;
                        }
                    } else {
                        pr.status = STATUS.RESOLVED;
                    }
                } else if (this.status === STATUS.REJECTED) {
                    var pr2 = onRejected(this.value).onReject = function () {
                        pr.status = STATUS.REJECTED;
                    };
                }
            }
        }.bind(this), 5);
        return pr;
    };
    this.status = STATUS.PENDING;
    this.value = undefined;

    this.onResolved = noop;
    this.onReject = noop;

    var resolve = function(value) {
        this.value = value;
        this.status = STATUS.RESOLVED;
        this.onResolved();
    }.bind(this);
    var reject = function(value) {
        this.value = value;
        this.status = STATUS.REJECTED;
        this.onReject();
    }.bind(this);

    this.executer(resolve, reject);
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

var makePromise  = makePromiseWithPromise(Promise, 'Promise ');
var makePromise2 = makePromiseWithPromise(Promise2, 'Promise2');

// console.log(new Promise(function(some, some) {}));

p1 = makePromise2('p1')();
p2 = p1.then(makePromise2('p2'));
p3 = p2.then(makePromise2('p3'));
p4 = p3.then(console.log).then(console.log);


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