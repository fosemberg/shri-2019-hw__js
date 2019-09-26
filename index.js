function run() {
  var counter = 0;
  var log = console.log;

  function makePromiseWithPromise(PromiseRealization, promiseName) {
    return function (message) {
      return function () {
        return new PromiseRealization(function (resolve, reject) {
          setTimeout(function () {
            var out = promiseName + ': ' + message + ' :' + ++counter;
            console.log(out);
            resolve(out);
          }, 1000)
        })
      }
    }
  }

  var makeNativePromise = makePromiseWithPromise(NativePromise, 'NativePromise ');
  var makeCustomPromise = makePromiseWithPromise(Promise, 'CustomPromise');

  function test() {
    makeCustomPromise('p1')()
      .then(makeCustomPromise('p2'))
      .then(makeCustomPromise('p3'))
      .then(makeCustomPromise('p4'));

    makeNativePromise('p1')()
      .then(makeNativePromise('p2'))
      .then(makeNativePromise('p3'))
      .then(makeNativePromise('p4'));
  }

  test()

  var promise = new Promise(function (resolve) {
    console.log(41);
    resolve(42)
  })

  promise
    .then(function (value) {
      return value + 1
    })
    .then(function (value) {
      console.log(value) // 43
      return new Promise(function (resolve) {
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
}


if (typeof window !== "undefined") {
  try {
    import("./Promise.js").then(run);
  } catch (e) {
    run();
  }
} else {
  var p = require('./Promise');
  run();
}