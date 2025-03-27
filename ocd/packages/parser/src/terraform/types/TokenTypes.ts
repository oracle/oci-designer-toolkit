/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export enum TokenTypes {
    ILLEGAL,
    ASSIGN,             // =
    BOOLEAN,            // true/false
    BRACECLOSE,         // }
    BRACEOPEN,          // {
    COLON,              // :
    COMMA,              // ,
    COMMENT,            // #
    DATA,               // TF data
    EOF,                // End Of File
    EOL,                // End Of line
    FILTER,             // TF Filter
    FUNCTION,           // TF Function
    IDENTIFIER,         // Unquoted String
    LOCALS,             // TF locals
    NUMBER,             // Numeric Value
    OUTPUT,             // TF output
    PROVIDER,           // TF provider
    QUOTES,             // "
    RESOURCE,           // TF resource 
    ROUNDBRACKETCLOSE,  // )
    ROUNDBRACKETOPEN,   // (
    SQUAREBRACKETCLOSE, // ]
    SQUAREBRACKETOPEN,  // [
    STRING,             // Quoted String
    TERRAFORM,          // TF terraform
    VARIABLE,           // TF variable
}

export const BlockTokens = [
    TokenTypes.DATA, 
    TokenTypes.LOCALS, 
    TokenTypes.OUTPUT, 
    TokenTypes.PROVIDER, 
    TokenTypes.RESOURCE, 
    TokenTypes.TERRAFORM,
    TokenTypes.VARIABLE,
]
