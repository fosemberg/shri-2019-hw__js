var promiseCounter = 0;
Promise2 = function(executor, isStarted) {
    this.id = ++promiseCounter;
    this.executer = executor;
    this.isStarted = isStarted === undefined ? true : false;
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
        var pr = new this.constructor(function (resolve, reject) {}, false);
        this.interval = setInterval(function() {
            if (this.status !== STATUS.PENDING) {
                clearInterval(this.interval);
                if (this.status === STATUS.RESOLVED) {
                    console.log('onFulfilled');
                    var pr2 = onFulfilled(this.value);
                    pr.executer = pr2.executer;
                    pr.isStarted = true;
                } else if (this.status === STATUS.REJECTED) {
                    var pr2 = onRejected(this.value);
                    pr.executer = pr2.executer;
                    pr.isStarted = true;
                }
            }
        }.bind(this), 5);
        // return this;
        return pr;
    };
    this.status = STATUS.PENDING;
    this.value = undefined;
    // this.getValue = function() {
    //     return this.value
    // };
    var resolve = function(value) {
        this.value = value;
        this.status = STATUS.RESOLVED;
    }.bind(this);
    var reject = function(value) {
        this.value = value;
        this.status = STATUS.REJECTED;
    }.bind(this);

    this.startInterval = undefined;
    this.startInterval = setInterval(function () {
        if (this.isStarted) {
            clearInterval(this.startInterval);
            this.executer(resolve, reject);
            console.log('started');
            this.isStarted = false;
        }
    }.bind(this), 1)
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