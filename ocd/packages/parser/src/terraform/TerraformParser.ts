/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { TerraformLexer } from "./TerraformLexer.js"
import { Token } from "./Token.js"
import { TerraformJson } from "./types/TerraformJson.js"
import { BlockTokens, TokenTypes } from "./types/TokenTypes.js"

export class TerraformParser {
    lexer: TerraformLexer
    terraformJson: TerraformJson

    constructor(input: string) {
        this.lexer = new TerraformLexer(input)
        this.terraformJson = {
            terraform: {},
            provider: {},
            resource: {},
            data: {},
            locals: {},
            output: {},
            variable: {}
        }
    }

    parse(): TerraformJson {
        let token: Token = this.lexer.nextToken()
        while (token.type !== TokenTypes.EOF) {
            switch(token.type) {
                case TokenTypes.RESOURCE: {
                    token = this.#parseResource()
                    break
                }
                case TokenTypes.DATA: {
                    token = this.#parseData()
                    break
                }
                case TokenTypes.LOCALS: {
                    token = this.#parseLocals()
                    break
                }
                case TokenTypes.OUTPUT: {
                    token = this.#parseOutput()
                    break
                }
                case TokenTypes.PROVIDER: {
                    token = this.#parseProvider()
                    break
                }
                case TokenTypes.TERRAFORM: {
                    token = this.#parseTerraform()
                    break
                }
                case TokenTypes.VARIABLE: {
                    token = this.#parseVariable()
                    break
                }
                default:
                    token = this.lexer.nextToken()
            }
        }
        return this.terraformJson
    }

    #parseData(): Token {
        let token: Token = this.lexer.nextToken()
        if (token.type === TokenTypes.STRING) {
            const resourceType = token.value
            token = this.lexer.nextToken()
            if (token.type === TokenTypes.STRING) {
                const resourceName = token.value
                if (!this.terraformJson.data.hasOwnProperty(resourceType)) this.terraformJson.data[resourceType] = {}
                this.terraformJson.data[resourceType][resourceName] = {}
                const resource = this.terraformJson.data[resourceType][resourceName]
                token = this.lexer.nextToken()
                if (token.type === TokenTypes.BRACEOPEN) token = this.lexer.nextToken()
                while (!BlockTokens.includes(token.type) && token.type !== TokenTypes.EOF) {
                    switch(token.type) {
                        case TokenTypes.IDENTIFIER: {
                            const identifierValue = this.#getIdentifierValue()
                            if (Array.isArray(identifierValue) && resource.hasOwnProperty(token.value)) {
                                resource[token.value] = [...resource[token.value], ...identifierValue]
                            } else {
                                resource[token.value] = identifierValue
                            }
                            // if (Array.isArray(identifierValue) && resource.hasOwnProperty(token.value)) {
                            //     if(Array.isArray(resource[token.value])) resource[token.value] = [...resource[token.value], ...identifierValue]
                            //     else resource[token.value] = [token.value, ...identifierValue]
                            // } else if (Array.isArray(identifierValue) && identifierValue.length > 0) {
                            //     resource[token.value] = identifierValue[0]
                            // } else {
                            //     resource[token.value] = identifierValue
                            // }
                            break
                        }
                    }
                    token = this.lexer.nextToken()
                }
            }
        }
        return token
    }

    #parseLocals(): Token {
        let token: Token = this.lexer.nextToken()
        if (token.type === TokenTypes.BRACEOPEN) token = this.lexer.nextToken()
        const locals = this.terraformJson.locals
        while (!BlockTokens.includes(token.type) && token.type !== TokenTypes.EOF) {
            switch(token.type) {
                case TokenTypes.IDENTIFIER: {
                    const identifierValue = this.#getIdentifierValue()
                    if (Array.isArray(identifierValue) && locals.hasOwnProperty(token.value)) {
                        locals[token.value] = [...locals[token.value], ...identifierValue]
                    } else {
                        locals[token.value] = identifierValue
                    }
                    break
                }
            }
            token = this.lexer.nextToken()
        }
        return token
    }
    
    #parseOutput(): Token {
        let token: Token = this.lexer.nextToken()
        if (token.type === TokenTypes.STRING) {
            const outputName = token.value
            token = this.lexer.nextToken()
            if (token.type === TokenTypes.BRACEOPEN) {token = this.lexer.nextToken()}
            this.terraformJson.output[outputName] = {}
            const output = this.terraformJson.output[outputName]
            while (!BlockTokens.includes(token.type) && token.type !== TokenTypes.EOF) {
                switch(token.type) {
                    case TokenTypes.IDENTIFIER: {
                        const identifierValue = this.#getIdentifierValue()
                        if (Array.isArray(identifierValue) && output.hasOwnProperty(token.value)) {
                            output[token.value] = [...output[token.value], ...identifierValue]
                        } else {
                            output[token.value] = identifierValue
                        }
                        break
                    }
                }
                token = this.lexer.nextToken()
            }
        }
        return token
    }

    #parseProvider(): Token {
        let token: Token = this.lexer.nextToken()
        if (token.type === TokenTypes.STRING) {
            const providerName = token.value
            token = this.lexer.nextToken()
            if (token.type === TokenTypes.BRACEOPEN) {token = this.lexer.nextToken()}
            if (!this.terraformJson.provider.hasOwnProperty(providerName)) {this.terraformJson.provider[providerName] = []}
            const providerEntriesArray = this.terraformJson.provider[providerName]
            const provider: Record<string, any> = {}
            providerEntriesArray.push(provider)
            while (!BlockTokens.includes(token.type) && token.type !== TokenTypes.EOF) {
                switch(token.type) {
                    case TokenTypes.IDENTIFIER: {
                        const identifierValue = this.#getIdentifierValue()
                        if (Array.isArray(identifierValue) && provider.hasOwnProperty(token.value)) {
                            provider[token.value] = [...provider[token.value], ...identifierValue]
                        } else {
                            provider[token.value] = identifierValue
                        }
                        break
                    }
                }
                token = this.lexer.nextToken()
            }
        }
        return token
    }

    #parseResource(): Token {
        let token: Token = this.lexer.nextToken()
        if (token.type === TokenTypes.STRING) {
            const resourceType = token.value
            token = this.lexer.nextToken()
            if (token.type === TokenTypes.STRING) {
                const resourceName = token.value
                if (!this.terraformJson.resource.hasOwnProperty(resourceType)) this.terraformJson.resource[resourceType] = {}
                this.terraformJson.resource[resourceType][resourceName] = {}
                const resource = this.terraformJson.resource[resourceType][resourceName]
                token = this.lexer.nextToken()
                if (token.type === TokenTypes.BRACEOPEN) token = this.lexer.nextToken()
                while (!BlockTokens.includes(token.type) && token.type !== TokenTypes.EOF) {
                    switch(token.type) {
                        case TokenTypes.IDENTIFIER: {
                            const identifierValue = this.#getIdentifierValue()
                            if (Array.isArray(identifierValue) && resource.hasOwnProperty(token.value)) {
                                resource[token.value] = [...resource[token.value], ...identifierValue]
                            } else {
                                resource[token.value] = identifierValue
                            }
                            // if (Array.isArray(identifierValue) && resource.hasOwnProperty(token.value)) {
                            //     if(Array.isArray(resource[token.value])) resource[token.value] = [...resource[token.value], ...identifierValue]
                            //     else resource[token.value] = [token.value, ...identifierValue]
                            // } else if (Array.isArray(identifierValue) && identifierValue.length > 0) {
                            //     resource[token.value] = identifierValue[0]
                            // } else {
                            //     resource[token.value] = identifierValue
                            // }
                            break
                        }
                    }
                    token = this.lexer.nextToken()
                }
            }
        }
        return token
    }

    #parseTerraform(): Token {
        let token: Token = this.lexer.nextToken()
        if (token.type === TokenTypes.BRACEOPEN) token = this.lexer.nextToken()
        const terraform = this.terraformJson.terraform
        while (!BlockTokens.includes(token.type) && token.type !== TokenTypes.EOF) {
            switch(token.type) {
                case TokenTypes.IDENTIFIER: {
                    const identifierValue = this.#getIdentifierValue()
                    if (Array.isArray(identifierValue) && terraform.hasOwnProperty(token.value)) {
                        terraform[token.value] = [...terraform[token.value], ...identifierValue]
                    } else {
                        terraform[token.value] = identifierValue
                    }
                    break
                }
            }
            token = this.lexer.nextToken()
        }
        return token
    }
    
    #parseVariable(): Token {
        let token: Token = this.lexer.nextToken()
        if (token.type === TokenTypes.STRING) {
            const variableName = token.value
            token = this.lexer.nextToken()
            if (token.type === TokenTypes.BRACEOPEN) {token = this.lexer.nextToken()}
            this.terraformJson.variable[variableName] = {}
            const variable = this.terraformJson.variable[variableName]
            while (!BlockTokens.includes(token.type) && token.type !== TokenTypes.EOF) {
                switch(token.type) {
                    case TokenTypes.IDENTIFIER: {
                        const identifierValue = this.#getIdentifierValue()
                        if (Array.isArray(identifierValue) && variable.hasOwnProperty(token.value)) {
                            variable[token.value] = [...variable[token.value], ...identifierValue]
                        } else {
                            variable[token.value] = identifierValue
                        }
                        break
                    }
                }
                token = this.lexer.nextToken()
            }
        }
        return token
    }

    #getIdentifierValue(): string | string[] | boolean | number | Record<string, any> | Record<string, any>[] {
        let identifierValue: string | string[] | boolean | number | Record<string, any> | Record<string, any>[] = ''
        let token: Token = this.lexer.nextToken()
        // console.debug('Identifier Value: Token', token)
        if (token.type === TokenTypes.ASSIGN) {
            // Simple Assignment
            token = this.lexer.nextToken()
            // console.debug('Identifier Value: Next Token', token)
            switch (token.type) {
                case TokenTypes.IDENTIFIER:
                case TokenTypes.STRING:
                    identifierValue = token.value
                    break
                case TokenTypes.NUMBER:
                    identifierValue = Number(token.value)
                    break
                case TokenTypes.BOOLEAN:
                    identifierValue = Boolean(token.value)
                    break
                case TokenTypes.BRACEOPEN: // Map
                    identifierValue = this.#getMapValues()
                    break
                case TokenTypes.SQUAREBRACKETOPEN: // Array
                    identifierValue = this.#getArrayValues()
                    break
            }
        } else if (token.type === TokenTypes.BRACEOPEN) {
            // Block Array Assignment
            identifierValue = this.#getBlockArrayValue()
        }
        return identifierValue
    }

    #getMapValues(): Record<string, any> {
        const mapValues: Record<string, any> = {}
        let token: Token = this.lexer.nextToken()
        let key: string | null = null
        while (token.type !== TokenTypes.BRACECLOSE) {
            switch(token.type) {
                case TokenTypes.STRING:
                    if (key === null) {key = token.value}
                    else {
                        mapValues[key] = token.value
                        key = null
                    } 
                    break
            }
            token = this.lexer.nextToken()
        }
        return mapValues
    }

    #getArrayValues(): string[] {
        let arrayValue: string[] = []
        let token: Token = this.lexer.nextToken()
        while (token.type !== TokenTypes.SQUAREBRACKETCLOSE && token.type !== TokenTypes.EOF) {
            // console.debug('Array Value: Token', token)
            switch(token.type) {
                case TokenTypes.IDENTIFIER:
                case TokenTypes.STRING:
                case TokenTypes.NUMBER:
                case TokenTypes.BOOLEAN:
                    arrayValue.push(token.value)
                    break
            }
            token = this.lexer.nextToken()
        }
        return arrayValue
    }

    #getBlockArrayValue(): Record<string, any>[] {
        // console.debug('Block Array Value')
        const blockArrayValue: Record<string, any> = {}
        let token: Token = this.lexer.nextToken()
        while (token.type !== TokenTypes.BRACECLOSE && token.type !== TokenTypes.EOF) {
            // console.debug('Block Array Value: Token', token)
            switch(token.type) {
                case TokenTypes.IDENTIFIER: {
                    const identifierValue = this.#getIdentifierValue()
                    blockArrayValue[token.value] = identifierValue
                    break
                }
            }
            token = this.lexer.nextToken()
        }

        return [blockArrayValue]
    }

}
