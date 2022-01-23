/// <reference types="cypress" />

describe('API tests', () => {
    it('Home displays correctly', () => {
        cy.visit('/')
        cy.contains('Home')
        cy.contains('View Texts')
        cy.contains('Add Text')
        cy.contains('View Languages')
        cy.contains('About')
    })
})