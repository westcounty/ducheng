/**
 * Photo verification using GLM-4V (智谱) multi-modal API.
 * Sends photo + prompt to the model, parses structured JSON response.
 *
 * Fallback rules:
 * - confidence >= threshold → approved
 * - confidence < threshold but > 0.5 → approved with warning
 * - GLM API unavailable → approved (graceful degradation)
 */

import { config } from '../../config.js'

/**
 * Build the verification prompt for GLM-4V.
 */
function buildPrompt(validationConfig) {
  const keywords = (validationConfig.keywords || []).join('、')
  return `你是一个照片审核助手。请判断这张照片是否符合以下要求：

要求：${validationConfig.prompt || '照片内容符合任务要求'}
关键元素：${keywords || '无特殊要求'}

请以 JSON 格式回复（不要包含 markdown 代码块标记），包含以下字段：
- pass: boolean，照片是否符合要求
- confidence: number (0-1)，你的置信度
- reason: string，简短的判定理由（中文，20字以内）

示例回复：{"pass": true, "confidence": 0.85, "reason": "照片清晰展示了武康大楼尖顶"}`
}

/**
 * Call GLM-4V API with the photo and prompt.
 *
 * @param {string} imageUrl - Full URL to the photo (must be publicly accessible)
 * @param {object} validationConfig - { prompt, keywords, accept_threshold }
 * @returns {Promise<{ passed: boolean, confidence: number|null, reason: string, warning?: string }>}
 */
export async function verifyPhoto(imageUrl, validationConfig) {
  const apiKey = config.glmApiKey
  const baseUrl = config.glmApiBaseUrl
  const model = config.glmModel

  // No API key → graceful degradation
  if (!apiKey) {
    return {
      passed: true,
      confidence: null,
      reason: 'Photo verification skipped (API key not configured)',
      warning: 'no_api_key',
    }
  }

  const threshold = validationConfig.accept_threshold || 0.7
  const prompt = buildPrompt(validationConfig)

  // Resolve image URL to absolute if it starts with /
  let fullImageUrl = imageUrl
  if (imageUrl.startsWith('/')) {
    // For local uploads, we need the full server URL
    // In production this would be the public domain
    const host = config.nodeEnv === 'production'
      ? 'https://ducheng-api.nju.top'
      : `http://localhost:${config.port}`
    fullImageUrl = `${host}${imageUrl}`
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: fullImageUrl } },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 256,
      }),
      signal: AbortSignal.timeout(30_000), // 30s timeout
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown')
      console.error(`GLM API error ${response.status}: ${errorText}`)
      // API error → graceful degradation
      return {
        passed: true,
        confidence: null,
        reason: 'Photo verification skipped (API error)',
        warning: 'api_error',
      }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    // Parse JSON from response (handle possible markdown code block wrapping)
    let result
    try {
      const jsonStr = content.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
      result = JSON.parse(jsonStr)
    } catch (parseErr) {
      console.error('GLM response parse error:', content)
      // Parse error → graceful degradation
      return {
        passed: true,
        confidence: null,
        reason: 'Photo verification skipped (parse error)',
        warning: 'parse_error',
      }
    }

    const confidence = typeof result.confidence === 'number' ? result.confidence : 0
    const aiPass = result.pass === true
    const reason = result.reason || ''

    // Apply threshold logic
    if (aiPass && confidence >= threshold) {
      return { passed: true, confidence, reason }
    }

    if (confidence > 0.5) {
      // Below threshold but above 0.5 → approve with warning (avoid false negatives)
      return {
        passed: true,
        confidence,
        reason,
        warning: 'low_confidence',
      }
    }

    // Clearly failed
    return {
      passed: false,
      confidence,
      reason: reason || 'Photo does not meet the requirements',
    }
  } catch (err) {
    console.error('GLM API call failed:', err.message)
    // Network/timeout error → graceful degradation
    return {
      passed: true,
      confidence: null,
      reason: 'Photo verification skipped (network error)',
      warning: 'network_error',
    }
  }
}
