#mongoose-number
===============

Provides Mongoose v2 Number support for [Mongoose](http://mongoosejs.com) v3.

[![Build Status](https://secure.travis-ci.org/aheckmann/mongoose-number.png)](http://travis-ci.org/aheckmann/mongoose-number)

Example:

```js
var mongoose = require('mongoose')
require('mongoose-number')(mongoose);

var partSchema = new Schema({ num: 'MongooseNumber' });
var Part = db.model('Part', partSchema);

var part = new Part({ num: 47 });
part.save(function (err) {
  Part.findById(part, function (err, part) {
    part.num.increment(); // uses atomic $inc
    part.save(function (err) {
      Part.findById(part, function (err, part) {
        console.log(part.num) // 48
      })
    })
  })
})
```

In Mongoose v2 every number was cast to this custom type. This type was removed due to the following caveats:

  [run this gist](https://gist.github.com/3239372)

Observe the result of `typeof a.n1`. Its "object" not "number"! Next observe the direct comparison of two mongoose numbers, `a.n1 == a.n2` is false. This makes javascript programs very sad.

So the benefits of handy helper methods that are rarely used (though convenient) did not outweigh the broken behavior they exhibit, hence their removal in v3.

Use this module at your own risk, or better yet, not at all.

## Provided number methods

- number#increment
- number#decrement
- number#$inc
- number#$dec

## Compatibility

- mongoose-number 0.0.2 is compatibile with `Mongoose >= v3.0.0 < v3.6.0`
- mongoose-number 0.1.0 is compatibile with `>= Mongoose v3.6.0`

[LICENSE](https://github.com/aheckmann/mongoose-number/blob/master/LICENSE)
