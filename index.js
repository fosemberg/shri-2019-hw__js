var promiseCounter = 0;
noop = function () {
};

Promise2 = function (executor) {

    if (typeof executor !== "function") {
        throw new TypeError(`Promise executor must be a function`);
    }

    var STATUS = {
        PENDING: 'pending',
        RESOLVED: 'resolved',
        REJECTED: 'rejected'
    };

    this.executer = executor;

    this.status = STATUS.PENDING;
    this.value = undefined;
    this.onResolved = noop;
    this.onReject = noop;
    this.onHandle = noop;

    // for debug
    this.id = ++promiseCounter;

    this.interval = undefined;
    this.then = function (onFulfilled, onRejected) {
        var pr = new this.constructor(noop);
        if (this.status !== STATUS.PENDING) {
            // SYNC {
            try {
                if (this.status === STATUS.RESOLVED) {
                    // SYNC all right {
                    var onFulfilledValue = onFulfilled(this.value);
                    if (this.constructor.prototype.isPrototypeOf(onFulfilledValue)) {
                        pr = onFulfilledValue;
                    } else {
                        pr.resolve(onFulfilledValue);
                    }
                    // SYNC all right }
                } else {
                    var onRejectedValue = onRejected ? onRejected(this.value) : onFulfilled(this.value);
                    if (this.constructor.prototype.isPrototypeOf(onRejectedValue)) {
                        pr = onRejectedValue;
                    } else {
                        pr.resolve(onRejectedValue);
                    }
                }
            } catch (e) {
                // SYNC error {
                onRejectedValue && onRejectedValue(this.value);
                pr.reject(this.value);
                // SYNC error }
            }
            // SYNC }
        } else {
            // ASYNC {
            this.onHandle = function () {
                try {
                    if (this.status === STATUS.RESOLVED) {

                        var onFulfilledValue = onFulfilled(this.value);
                        if (this.constructor.prototype.isPrototypeOf(onFulfilledValue)) {
                            onFulfilledValue.onResolved = pr.resolve;
                        } else {
                            pr.resolve(onFulfilledValue);
                        }
                    } else if (this.status === STATUS.REJECTED) {
                        var onRejectedValue = onRejected(this.value);
                        if (this.constructor.prototype.isPrototypeOf(onRejectedValue)) {
                            onRejectedValue.onReject = pr.reject;
                        } else {
                            pr.reject(onRejectedValue);
                        }
                    }
                } catch (e) {
                    // ASYNC error {
                    onRejectedValue && onRejectedValue(this.value);
                    pr.reject(this.value);
                    // ASYNC error }
                }
            }.bind(this);
            // ASYNC }
        }
        return pr;
    }.bind(this);

    this.resolve = function (value) {
        this.status = STATUS.RESOLVED;
        this.onResolved();

        this.value = value;
        this.onHandle();
    }.bind(this);
    this.reject = function (value) {
        this.status = STATUS.REJECTED;
        this.onReject();

        this.value = value;
        this.onHandle();
    }.bind(this);

    try {
        this.executer(this.resolve, this.reject);
    } catch (e) {
        console.log(e);
    }
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

function test() {
    p1 = makePromise2('p1')()
        .then(makePromise2('p2'))
        .then(makePromise2('p3'))
        .then(console.log)
        .then(console.log)
        .then(makePromise2('p4'));

    p1 = makePromise('p1')()
        .then(makePromise('p2'))
        .then(makePromise('p3'))
        .then(console.log)
        .then(console.log)
        .then(makePromise('p4'));
}

test()

var promise = new Promise2(function (resolve) {
    console.log(41);
    resolve(42)
})

promise
    .then(function (value) {
        return value + 1
    })
    .then(function (value) {
        console.log(value) // 43
        return new Promise2(function (resolve) {
            resolve(137)
        })
    })
    .then(function (value) {
        console.log(value) // 137
        throw new Error()
    })
    .then(
        function () {
            console.log('Будет проигнорировано')
            return 'something';
        },
        function () {
            throw new Error();
            return 'ошибка обработана'
        }
    )
    .then(function (value) {
            console.log(value) // "ошибка обработана"
        },
        function (value) {
            console.log('Was error: ' + value);
        });