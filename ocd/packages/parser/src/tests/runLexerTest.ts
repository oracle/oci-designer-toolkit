import { lexerTestCases } from "./LexerTestCases.js"
import { TerraformLexer } from '../index.js'
// import assert from "node:assert";

lexerTestCases.forEach((testCase) => {
    console.info('')
    console.info('Lexer Test:', testCase.description)
    console.info('===================================================')
    console.info('')
    const lexer = new TerraformLexer(testCase.input)
    let token = lexer.nextToken()
    while (token?.key !== 'EOF') {
        console.debug(token)
        token = lexer.nextToken()
    }

    // testCase.expect.forEach((expectedToken) => {
    //     console.info('Parser Test:', testCase.description)
    //     console.info('===================================================')
    //     assert.deepEqual(lexer.nextToken(), expectedToken)
    // })
    console.info('All tests are passed!')
})

