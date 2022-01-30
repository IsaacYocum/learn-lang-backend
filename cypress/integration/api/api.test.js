/// <reference types="cypress" />

describe('API tests', () => {
    context('/api/texts', () => {
        it('GET all texts', () => {
            cy.request('GET', '/api/languages/english/texts')
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
                    expect(resp.body).to.be.a('object')
                    expect(resp.body).property('textId').eq(textId)
                    expect(resp.body).property('title')
                    expect(resp.body).property('text')
                })
        })

        it('GET with invalid textId', () => {
            let textId = 'asdf'
            cy.request({ method: 'GET', url: `/api/texts/` + textId, failOnStatusCode: false })
                .should((resp) => {
                    expect(resp.status).to.eq(400)
                    expect(resp.body).eq('An invalid textId was specified.')
                })
        })

        it('GET with non-existant textId', () => {
            let textId = 1234
            cy.request({ method: 'GET', url: `/api/texts/` + textId, failOnStatusCode: false })
                .should((resp) => {
                    expect(resp.status).to.eq(404)
                    expect(resp.body).eq('Not Found')
                })
        })

        it('POST a new text', () => {
            let text = {
                "title": "cypress title",
                "text": "cypress text",
                "language": "english"
            }

            cy.request('POST', '/api/addtext', text)
                .then((resp) => {
                    let createdId = resp.headers.location.match(new RegExp("\\d+"))

                    expect(resp.status).to.eq(201)
                    expect(!resp.body)
                    expect(resp.headers.location).to.eq("/texts/viewtext/" + createdId)

                    cy.request('GET', 'api/texts/' + createdId)
                    .then((resp) => {
                        expect(resp.body.title).eq(text.title)
                        expect(resp.body.text).eq(text.text)
                        expect(resp.body.title).eq(text.title)

                        cy.request('DELETE', '/api/texts/' + createdId)
                        .then((resp) => {
                            expect(resp.status).to.eq(200)
                        })
                    })
                })

        })
    })
})
