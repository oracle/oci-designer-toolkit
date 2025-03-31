/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { TokenTypes } from "./types/TokenTypes.js"
import { Token } from "./Token.js"

export class TerraformLexer {
    data: string
    position: number
    nextPosition: number
    char: string
    previousChar: string
    previousToken: Token = new Token(TokenTypes.ILLEGAL, 'ILLEGAL', '')

    constructor(input: string) {
        this.data = input
        this.position = 0
        this.nextPosition = 1
        this.char = this.data[this.position] || ''
        this.previousChar = ''
        // console.debug('>>>> Backslash at:', this.data.indexOf('\\'))
    }

    nextToken(): Token {
        this.#skipWhitespace()
        let token: Token | null = null
        // let token: Token | null = null

        if (this.char === '=') {token = new Token(TokenTypes.ASSIGN, 'ASSIGN', this.char)}
        else if (this.char === '}') {token = new Token(TokenTypes.BRACECLOSE, 'BRACECLOSE', this.char)}
        else if (this.char === '{') {token = new Token(TokenTypes.BRACEOPEN, 'BRACEOPEN', this.char)}
        else if (this.char === ')') {token = new Token(TokenTypes.ROUNDBRACKETCLOSE, 'ROUNDBRACKETCLOSE', this.char)}
        else if (this.char === '(') {token = new Token(TokenTypes.ROUNDBRACKETOPEN, 'ROUNDBRACKETOPEN', this.char)}
        else if (this.char === ']') {token = new Token(TokenTypes.SQUAREBRACKETCLOSE, 'SQUAREBRACKETCLOSE', this.char)}
        else if (this.char === '[') {token = new Token(TokenTypes.SQUAREBRACKETOPEN, 'SQUAREBRACKETOPEN', this.char)}
        else if (this.char === ':') {token = new Token(TokenTypes.COLON, 'COLON', this.char)}
        else if (this.char === ',') {token = new Token(TokenTypes.COMMA, 'COMMA', this.char)}
        else if (this.char === '#') {token = new Token(TokenTypes.COMMENT, 'COMMENT', this.#readToEoL())}
        else if (this.char === '"') {token = new Token(TokenTypes.STRING, 'STRING', this.#readToNextQuote())}
        else if (this.#charIsNumber()) {token = new Token(TokenTypes.NUMBER, 'NUMBER', this.#readNumber())}
        else if (this.#charIsLetter()) {
            const value = this.#readIdentifier()
            switch (value) {
                case 'true':
                case 'false': {
                    token = new Token(TokenTypes.BOOLEAN, 'BOOLEAN', value)
                    break
                }
                case 'data': {
                    token = new Token(TokenTypes.DATA, 'DATA', value)
                    break
                }
                case 'locals': {
                    token = new Token(TokenTypes.LOCALS, 'LOCALS', value)
                    break
                }
                case 'output': {
                    token = new Token(TokenTypes.OUTPUT, 'OUTPUT', value)
                    break
                }
                case 'provider': {
                    if (this.previousToken.type === TokenTypes.BRACEOPEN) token = new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', value) // Inside a resource block
                    else token = new Token(TokenTypes.PROVIDER, 'PROVIDER', value)
                    break
                }
                case 'resource': {
                    token = new Token(TokenTypes.RESOURCE, 'RESOURCE', value)
                    break
                }
                case 'terraform': {
                    token = new Token(TokenTypes.TERRAFORM, 'TERRAFORM', value)
                    break
                }
                case 'variable': {
                    token = new Token(TokenTypes.VARIABLE, 'VARIABLE', value)
                    break
                }
                case 'base64encode': {
                    token = new Token(TokenTypes.FUNCTION, 'FUNCTION', value)
                    break
                }
                default: {
                    token = new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', value)
                }
            }
            
        }
        else if (this.char === '') {token = new Token(TokenTypes.EOF, 'EOF', '')}
        else {token = new Token(TokenTypes.ILLEGAL, 'ILLEGAL', this.char)}

        this.#advanceChar()
        this.previousToken = token
        return token
    }

    #advanceChar() {
        this.previousChar = this.char
        if (this.nextPosition >= this.data.length) {
            this.char = ''
        } else {
            this.char = this.data[this.nextPosition]
        }
        this.position = this.nextPosition
        this.nextPosition += 1
        // console.debug('advanceChar: Char:', this.char, 'Previous Char:', this.previousChar)
    }

    #revertChar() {
        this.nextPosition -= 1
        this.char = this.previousChar
        this.previousChar = ''
    }

    #charIsNumber(): boolean {
        const regExp = new RegExp(/^-?\d+$/)
        return regExp.test(this.char)
    }

    #charIsLetter(): boolean {
        const regExp = new RegExp(/[a-z]/i)
        return regExp.test(this.char)
    }

    #charIsExtendedAlphaNumeric(): boolean {
        // const regExp = new RegExp(/[a-z]/i)
        const regExp = new RegExp(/[\w-/.]/)
        return regExp.test(this.char)
    }

    #readNumber(): string {
        const start = this.position
        while (this.#charIsNumber()) {
            this.#advanceChar()
        }
        return this.data.slice(start, this.position)
    }

    #readIdentifier(): string {
        const start = this.position
        while (this.#charIsExtendedAlphaNumeric()) {
            this.#advanceChar()
        }
        this.#revertChar()
        return this.data.slice(start, this.position)
    }

    #readString(): string {
        const start = this.position
        while (this.#charIsExtendedAlphaNumeric()) {
            this.#advanceChar()
        }
        return this.data.slice(start, this.position)
    }

    #readToEoL(): string {
        const start = this.position
        while (!['\n', '\r'].includes(this.char)) {
            this.#advanceChar()
        }
        return this.data.slice(start, this.position)
    }

    #readToNextQuote(): string {
        this.#advanceChar()
        const start = this.position
        while (this.char !== '"' || (this.char === '"' && this.previousChar === '\\')) {
            this.#advanceChar()
        } 
        // console.debug(this.data.slice(start, this.position))
        return this.data.slice(start, this.position)
    }

    #skipWhitespace() {
        const whitespace = [' ', '\t', '\n', '\r']
        while (whitespace.includes(this.char)) {
            this.#advanceChar()
        }
    }

}
