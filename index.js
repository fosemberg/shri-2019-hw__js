function run() {
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

  var makePromise = makePromiseWithPromise(NativePromise, 'NativePromise ');
  var makePromise2 = makePromiseWithPromise(Promise, 'CustomPromise');

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