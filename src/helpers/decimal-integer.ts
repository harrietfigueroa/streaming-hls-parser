/**
 * Helper types for validating decimal integers
 */

// Helper type to check if a string represents a valid decimal integer
export type IsDecimalInteger<T extends string> =
    // Step 1: Check if the string has at least one character
    T extends `${infer FirstChar}${infer Remaining}`
    // Step 2: Check if the first character is a valid digit (0-9) or a minus sign
    ? FirstChar extends '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
    // Step 3a: If it's a valid digit, check if there are more characters
    ? Remaining extends ''
    // Step 4a: If no more characters, we have a single digit, so return true
    ? true
    // Step 4b: If there are more characters, check the next digit
    : Remaining extends `${infer NextDigit}${infer NextRemaining}`
    // Step 5: Check if the next character is also a valid digit (0-9)
    ? NextDigit extends '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
    // Step 6a: If it's a valid digit, check if there are more characters
    ? NextRemaining extends ''
    // Step 7a: If no more characters, we have a valid multi-digit number, so return true
    ? true
    // Step 7b: If there are more characters, recursively check the remaining string
    : IsDecimalInteger<Remaining>
    // Step 6b: If the next character is not a valid digit, return false
    : false
    // Step 5b: If we can't extract a next digit, return false
    : false
    // Step 3b: If the first character is not a valid digit, check if it's a minus sign
    : FirstChar extends '-'
    // Step 3c: If it's a minus sign, check if there are digits after it
    ? Remaining extends `${infer Digit}${infer NextRemaining}`
    // Step 4c: Check if the character after minus is a valid digit (0-9)
    ? Digit extends '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
    // Step 5c: If it's a valid digit, check if there are more characters
    ? NextRemaining extends ''
    // Step 6c: If no more characters, we have a valid negative single digit, so return true
    ? true
    // Step 6d: If there are more characters, recursively check the remaining string
    : IsDecimalInteger<Remaining>
    // Step 5d: If the character after minus is not a valid digit, return false
    : false
    // Step 4d: If we can't extract a digit after minus, return false
    : false
    // Step 3d: If the first character is not a digit or minus sign, return false
    : false
    // Step 2b: If we can't extract a character, return false
    : false; 