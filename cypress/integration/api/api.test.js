/// <reference types="cypress" />

describe('API tests', () => {
    context('/api/texts', () => {
        it('GET', () => {
            cy.request('GET', '/api/texts')
                .should((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body).to.be.a('array')
                })
        })
    })

    context('/api/texts/:textId', () => {
        it('GET with valid textId', () => {
            let textId = 4
            cy.request('GET', `/api/texts/` + textId)
                .should((resp) => {
                    expect(resp.status).to.eq(200)
                    expect(resp.body).to.be.a('array')
                    expect(resp.body).to.have.property('length').eq(1)
                    expect(resp.body[0]).property('textId').eq(textId)
                    expect(resp.body[0]).property('title')
                    expect(resp.body[0]).property('text')
                })
        })

        it('GET with invalid textId', () => {
            let textId = 'asdf'
            cy.request({method: 'GET', url: `/api/texts/` + textId, failOnStatusCode: false})
                .should((resp) => {
                    expect(resp.status).to.eq(400)
                    expect(resp.body).eq('An invalid textId was specified.')
                })
        })
    })
})
