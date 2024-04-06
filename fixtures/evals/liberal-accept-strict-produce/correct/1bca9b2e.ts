// Example 1: Parsing user input with broad acceptance and strict output
function parseUserId(input: string | number): number {
  // Accepts both string and number, but always returns a number
  return typeof input === 'string' ? parseInt(input, 10) : input
}

// Generated by gpt-4-0125-preview
