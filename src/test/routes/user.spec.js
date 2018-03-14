const request = require('supertest');
const chai = require('chai');
const app = require('../../app');
const expect = chai.expect;
before(function() {
});

describe('User Route', function() {
  context(`GET ${'/users'}/`, function() {
    it('Should return a 200 status', function() {
      return request(app)
        .get(`${'/users'}/`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect('Content-Type', /json/)
        .expect(200);
    });

    it('Should return all user', function() {
      return request(app)
        .get('/users')
        .set('Accept', 'application/json')
        .then((res) => {
          expect(res.body).to.not.be.empty;
          expect(res.body).to.be.a('array');
        });
    });
  });
});
