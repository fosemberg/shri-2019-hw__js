Promise = function(executor) {
    this.executer = executor;
    this.checkIsPending = function() {return this.status === 'pending'};
    this.interval = undefined;
    this.then = function(_resolve) {
        this.interval = setInterval(function() {
            if (!this.checkIsPending()) {
                _resolve(this.value);
                clearInterval(this.interval);
                // return new this.constructor(this.callback);
            }
        }.bind(this), 5);
        var pr = new this.constructor(function(resolve, reject){});
        console.log (pr)
        return pr;
    }
    this.status = 'pending';
    this.value = undefined;
    // this.getValue = function() {
    //     return this.value
    // };
    var resolve = function(value) {
        this.value = value;
        this.status = 'resolved';
    }.bind(this);
    var reject = function(value) {
        this.value = value;
        this.status = 'rejected';
    }.bind(this);
    this.executer(resolve, reject)
}

p = new Promise(function(resolve, reject) {
    setTimeout(function() { resolve(7) }, 1000)
});
p1 = p.then(console.log)
p2 = p1.then(console.log)

// p2 = new Promise(function(resolve, reject) {
//     setTimeout(function() {resolve(2)}, 2000);
// });
//
// p3 = p2.then(console.log);
// p3.then(console.log)
// console.log(p3)