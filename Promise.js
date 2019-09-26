(function () {
  var getCustomPromise = function () {
    // for debug {
    var promiseCounter = 0;
    // for debug }

    var noop = function () {
    };
    var CustomPromise = function (executor) {

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
    CustomPromise.resolve = function (value) {
      return new CustomPromise(function (resolve, reject) {
        resolve(value)
      })
    };
    CustomPromise.reject = function (value) {
      return new CustomPromise(function (resolve, reject) {
        reject(value)
      })
    };

    return CustomPromise;
  }

  var _global = typeof window !== 'undefined' ? window : global;
  var isNativePromise = typeof _global['Promise'] !== 'undefined';

  var rewritePromiseAlways = true;
  if (rewritePromiseAlways) {
    if (isNativePromise) {
      _global['NativePromise'] = Promise;
    } else {
      _global['NativePromise'] = getCustomPromise();
    }
  }

  if (rewritePromiseAlways || isNativePromise) {
    _global['Promise'] = getCustomPromise();
  }
})()