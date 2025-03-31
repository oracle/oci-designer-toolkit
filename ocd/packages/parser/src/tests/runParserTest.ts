import { TerraformParser } from '../index.js'
import { parserTestTests } from "./ParserTestCases.js"
// import assert from "node:assert";

// Test Parser

parserTestTests.forEach((testCase) => {
    console.info('')
    console.info('Parser Test:', testCase.description)
    console.info('===================================================')
    console.info('')
    const parser = new TerraformParser(testCase.input)
    console.info(JSON.stringify(parser.parse(), null, 2))
    
})
