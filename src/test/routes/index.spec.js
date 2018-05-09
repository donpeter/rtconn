const request = require('supertest');
const chai = require('chai');

const expect = chai.expect;
const app = require('../../app');

before(function() {
});
beforeEach('some description', function() {
  // beforeEach:some description
  // await db.clear();
  // await db.save([tobi, loki, jane]);
});


describe('Index Route', function() {
  context('Index GET /', function() {
    it('Should return a 200 status', function() {
      return request(app).get('/').expect(200);
    });
  });
  context('GET /webrtc', function() {
    it('Should return a 200', function() {
      return request(app)
        .get('/webrtc')
        .expect(200);
    });
  });
});
