const request = require('supertest-as-promised'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised');

const app = require('../../app');
chai.use(chaiAsPromised);
const expect = chai.expect;


before(function() {
});
beforeEach('some description', function() {
  // beforeEach:some description
  // await db.clear();
  // await db.save([tobi, loki, jane]);
});


describe('Index Route', function() {
  context('GET /', function() {
    it('Should return a 200 status', function() {
      return request(app).get('/').expect(200);
    });
  });
  context.skip('GET /test', function() {
    it('Should return a 200 and include { foo: "foo"} ', function() {
      return request(app)
        .get('/test')
        .expect(200)
        .then((res) => {
          return expect(res.body).to.deep.include({foo: 'foo'});
        });
    });
  });
});
