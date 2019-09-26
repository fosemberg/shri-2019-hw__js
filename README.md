#### Полифил для ES6 Promise

#### Особенности реализации

При написание этого полифила для его тестирования оставляю нативную реализацию Promise, в случае если она есть. И даже если полифил уже есть я все равно его перезаписываю, а нативный полифил сохраняю, как NativePolyfill. Это нужно, исключительно для интерактивного сравнения кастомного полифилла с обычным.

#### Требования
* Код написан без ES6 классов и стрелочных функций
* Код оформлен в едином стиле
* Приведены примеры использования и развернутое текстовое описание

#### Рекомендации
* Реализовать полифил внутри IIFE
* Проверить наличие нативных обещаний при помощи //надежных// методов
* Использовать защитное программирование

#### Основное задание
Создать полифил, который позволит:
* Создать обещание и выполнить асинхронную операцию через resolve или reject
* Обрабатывать цепочкой результаты асинхронных операций при помощи метода then, которые работает аналогично методу из ES6

Формальное описание then: https://promisesaplus.com/

##### Возможный сценарий использования полифила
```
var promise = new Promise(function (resolve){
    resolve(42)
})

promise
    .then(function (value) {
        return value + 1
    })
    .then(function (value) {
        console.log(value) // 43
        return new Promise(function (resolve) { resolve(137) })
    })
    .then(function (value) {
        console.log(value) // 137
        throw new Error()
    })
    .then(
        function () { console.log('Будет проигнорировано') },
        function () { return 'ошибка обработана' }
    )
    .then(function (value) {
        console.log(value) // "ошибка обработана"
    })
```

#### Замечания

* Кроме метода then приветствуется реализация catch в виде обертки над then
* Поведение, связанное с обработкой thenable объектов, разрешается опустить

#### Бонусное задание
Расширить реализацию статическими методами, работающими аналогично спецификации ES6
* Promise.all
* Promise.race
* Promise.resolve
* Promise.reject

#### Задание со звездочкой
Засчитывается только при условии выполнения бонусного задания

Реализовать метод finally и done, который прервет цепочку обещаний и при необходимости обработает ошибку