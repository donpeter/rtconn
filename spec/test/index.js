const request = require('superagent');
const chai = require('chai');
const expect = chai.expect;
// const should = chai.should();

const port = process.env.PORT || '8080';
const url = process.env.URL + `:${port}` || `http://localhost:${port}`;
before(function() {

});
describe('Index Route', function() {
  context('GET /', function() {
    it('Should return a 200 status', function() {
      return request
        .get(url)
        .then(res => expect(res.status).to.equal(200));
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
