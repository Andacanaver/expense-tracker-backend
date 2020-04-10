const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Expense Endpoint', function() {
    let db 

    const {testUsers, testExpenses} = helpers.makeFixtures()
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL
        });
        app.set('db', db);
    })

    after('disconnect from db', () => db.destroy())

    before("cleanup", () => helpers.cleanTables(db));

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe('GET /api/expenses', () => {
        context('Given there are products in the database', () => {
            beforeEach('insert Expenses', () => {
                helpers.seedExpenseTable(db, testUsers, testExpenses)
            })

            it('responds with 200 and all users expenses', () => {
                const expectedExpenses = helpers.makeExpectedUserExpenses(testUsers[0], testExpenses)
                const makeExpExpenses = expectedExpenses.map(expense => helpers.makeExpectedExpense(expense))
                return supertest(app)
                    .get('/api/expenses')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, makeExpExpenses)
            })
        })
    })
})