/**
 * Puzzle and quiz answer verification.
 * - Puzzle: case-insensitive text match against answer + variants
 * - Quiz: index match against correct_index
 */

/**
 * Normalize text for comparison: trim, lowercase, collapse whitespace,
 * remove common punctuation.
 */
function normalize(text) {
  if (typeof text !== 'string') return ''
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[.,;:!?。，；：！？、\-—–_'"'""\s]/g, '')
}

/**
 * Verify a puzzle answer against the correct answer and variants.
 *
 * @param {{ answerText: string }} submission - User's answer
 * @param {{ answer: string, answer_variants?: string[], answer_type?: string }} validationConfig
 * @returns {{ passed: boolean, correct: boolean, reason: string }}
 */
export function verifyPuzzle(submission, validationConfig) {
  const userAnswer = normalize(submission.answerText)

  if (!userAnswer) {
    return { passed: false, correct: false, reason: 'No answer provided' }
  }

  const correctAnswer = normalize(validationConfig.answer || '')
  const variants = (validationConfig.answer_variants || []).map(normalize)

  // Check main answer
  if (userAnswer === correctAnswer) {
    return { passed: true, correct: true, reason: 'Correct answer' }
  }

  // Check variants
  for (const variant of variants) {
    if (variant && userAnswer === variant) {
      return { passed: true, correct: true, reason: 'Correct (variant match)' }
    }
  }

  // Check if user answer contains the correct answer or vice versa
  if (correctAnswer && (userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer))) {
    return { passed: true, correct: true, reason: 'Correct (partial match)' }
  }

  for (const variant of variants) {
    if (variant && (userAnswer.includes(variant) || variant.includes(userAnswer))) {
      return { passed: true, correct: true, reason: 'Correct (partial variant match)' }
    }
  }

  return { passed: false, correct: false, reason: 'Incorrect answer' }
}

/**
 * Verify a quiz selection against the correct index.
 *
 * @param {{ selectedIndex: number }} submission - User's selection (0-based index)
 * @param {{ correct_index: number, options: string[] }} validationConfig
 * @returns {{ passed: boolean, correct: boolean, reason: string }}
 */
export function verifyQuiz(submission, validationConfig) {
  const selectedIndex = parseInt(submission.selectedIndex, 10)

  if (isNaN(selectedIndex)) {
    return { passed: false, correct: false, reason: 'No selection provided' }
  }

  const correctIndex = validationConfig.correct_index
  const options = validationConfig.options || []

  if (selectedIndex < 0 || selectedIndex >= options.length) {
    return { passed: false, correct: false, reason: 'Invalid selection index' }
  }

  const isCorrect = selectedIndex === correctIndex

  return {
    passed: isCorrect,
    correct: isCorrect,
    reason: isCorrect
      ? 'Correct answer'
      : `Incorrect — selected "${options[selectedIndex]}"`,
  }
}
