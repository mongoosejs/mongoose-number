
var assert = require('assert')
var NumberModule = require('../')
var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var NumberSchema;
var MongooseNumber;

describe('MongooseNumber', function(){
  before(function(){
    NumberSchema = NumberModule(mongoose)
    MongooseNumber = mongoose.Types.MongooseNumber;
  })

  it('has a version', function(){
    assert.equal('string', typeof NumberModule.version);
    console.log(NumberModule.version);
  })

  it('is a function', function(){
    assert.equal('function', typeof NumberSchema);
  })

  it('extends mongoose.Schema.Types', function(){
    assert.ok(Schema.Types.MongooseNumber);
    assert.equal(NumberSchema, Schema.Types.MongooseNumber);
  })

  it('extends mongoose.Types', function(){
    assert.ok(mongoose.Types.MongooseNumber);
  })

  it('can be used in schemas', function(){
    var s = new Schema({ num: NumberSchema });
    var num = s.path('num')
    assert.ok(num instanceof mongoose.SchemaType);
    assert.equal('function', typeof num.get);

    var s = new Schema({ num: 'MongooseNumber' });
    var num = s.path('num')
    assert.ok(num instanceof mongoose.SchemaType);
    assert.equal('function', typeof num.get);
  })

  describe('integration', function(){
    var db, S, schema, id;

    before(function(done){
      db = mongoose.createConnection('localhost', 'mongoose_number')
      db.once('open', function () {
        schema = new Schema({ num: NumberSchema, name: String, docs: [{ title: String }] });
        S = db.model('MNumber', schema);
        done();
      });
    })

    // inc, dec, querycasting null
    describe('subclassing', function(){
      it('is an instanceof Number', function(){
        var n = new MongooseNumber('5');
        assert.ok(n instanceof Number);
        assert.ok(n instanceof MongooseNumber);
        assert.equal('5', n.toString());
        assert.equal(Object, n._atomics.constructor);
      })
    })

    describe('casts', function(){
      it('numbers', function(){
        var v = 20;
        var s = new S({ num: v });
        assert.ok(s.num instanceof mongoose.Types.MongooseNumber);
        assert.equal(v, s.num.valueOf());

        v = new Number(20);
        s = new S({ num: v });
        assert.ok(s.num instanceof mongoose.Types.MongooseNumber);
        assert.equal(v, +s.num);
      });

      describe('strings', function(){
        it('with length', function(){
          var v = '20';
          var s = new S({ num: v });
          assert.ok(s.num instanceof mongoose.Types.MongooseNumber);
          assert.equal(+v, s.num.valueOf());
        })
        it('that are empty to null', function(){
          var v = '';
          var s = new S({ num: v });
          assert.equal(null, s.num);
        })
      });

      it('null', function(){
        var s = new S({ num: null });
        assert.equal(null, s.num);
      })

      it('MongooseNumber', function(){
        var s = new S({ num: new mongoose.Types.MongooseNumber("90") });
        assert.ok(s.num instanceof mongoose.Types.MongooseNumber);
        assert.equal(90, s.num.valueOf());
      })

      it('non-castables produce _saveErrors', function(done){
        var schema = new Schema({ num: 'MongooseNumber' }, { strict: 'throw' });
        var M = db.model('throws', schema);
        var m = new M({ num: [] });
        m.save(function (err) {
          assert.ok(err);
          assert.equal('MongooseNumber', err.type);
          assert.equal('CastError', err.name);
          done();
        });
      })

      it('queries with null properly', function(done){
        S.create({ num: null }, function (err) {
          assert.ifError(err);
          S.findOne({ num: null }, function (err, doc) {
            assert.ifError(err);
            assert.equal(null, doc.num);
            done();
          })
        })
      })
    })

    it('can be saved', function(done){
      var s = new S({ num: 20, name: 'Skyler', docs: [{ title: 'Jesse' }] });
      id = s.id;
      s.save(function (err) {
        assert.ifError(err);
        done();
      })
    })

    it('is queryable', function(done){
      S.findById(id, function (err, doc) {
        assert.ifError(err);
        assert.ok(doc.num instanceof MongooseNumber);
        assert.equal(20, +doc.num);
        done();
      });
    })

    it('can be updated', function(done){
      S.findById(id, function (err, doc) {
        assert.ifError(err);
        doc.num += 10;
        doc.save(function (err) {
          assert.ifError(err);
          S.findById(id, function (err, doc) {
            assert.ifError(err);
            assert.equal(30, doc.num);
            done();
          });
        })
      })
    })

    it('can be incremented atomically', function(done){
      S.findById(id, function (err, doc) {
        assert.ifError(err);
        assert.equal(1, doc.docs.length);
        doc.name = 'Walt';
        doc.docs.push({ title: 'Gus' });
        doc.num.increment();

        var delta = doc.$__delta();
        assert.equal(2, delta.length);
        assert.ok(delta[1].$inc);
        assert.equal(1, delta[1].$inc.num);
        assert.ok(delta[1].$set);
        assert.equal('Walt', delta[1].$set.name);
        assert.equal('Gus', delta[1].$pushAll.docs[0].title);
        doc.save(function (err) {
          assert.ifError(err);
          S.findById(id, function (err, doc) {
            assert.ifError(err);
            assert.equal(31, doc.num);
            assert.equal('Walt', doc.name);
            assert.equal(2, doc.docs.length);
            assert.equal('Jesse', doc.docs[0].title);
            assert.equal('Gus', doc.docs[1].title);

            // gh-1
            doc.num.increment();
            doc.num.increment();
            doc.num.increment(2);
            doc.save(function (err) {
              assert.ifError(err);
              S.findById(id, function (err, doc) {
                assert.ifError(err);
                assert.equal(35, doc.num);
                done();
              })
            })
          });
        })
      })
    })

    it('can be decremented atomically', function(done){
      S.findById(id, function (err, doc) {
        assert.ifError(err);
        doc.num.decrement();
        var delta = doc.$__delta();
        assert.equal(2, delta.length);
        assert.ok(delta[1].$inc);
        assert.equal(-1, delta[1].$inc.num);
        doc.save(function (err) {
          assert.ifError(err);
          S.findById(id, function (err, doc) {
            assert.ifError(err);
            assert.equal(34, doc.num);

            doc.num.$dec({});
            doc.num.$dec(3.1);
            assert.equal(-4.1, doc.num._atomics.$inc);
            doc.save(function (err) {
              assert.ifError(err);

              S.findById(id, function (err, doc) {
                assert.ifError(err);
                assert.equal(29.9, doc.num);
                done();
              })
            })
          });
        })
      })
    })

    it('can be required', function(done){
      var s = new Schema({ num: { type: MongooseNumber, required: true }});
      var M = db.model('required', s);
      var m = new M;
      m.save(function (err) {
        assert.ok(err);
        m.num = 10;
        m.validate(function (err) {
          assert.ifError(err);
          done();
        })
      })
    })


  })
})
