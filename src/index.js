const core = require('@actions/core');
const fs = require('fs');
const PROMPT = `You are a PR Sentiment Analyzer. Your task is to analyze the sentiment of a pull request description and its comments to identify potentially negative, confusing, or unclear language. You will provide a sentiment score and highlight specific phrases that contribute to that score.

Here's the information you will be working with:

**Pull Request Description:** {pr_description}

**Pull Request Comments:** {pr_comments}

**Instructions:**

1.  **Analyze Sentiment:** Determine the overall sentiment of the PR description and comments. Consider the presence of negative words, sarcasm, ambiguity, and potentially confusing language.

2.  **Sentiment Score:** Assign a sentiment score from -1 (very negative) to 1 (very positive). 0 represents neutral sentiment.

3.  **Highlight Problematic Phrases:** Identify and extract specific phrases from the description and comments that contribute to a negative or confusing sentiment. Explain *why* each phrase is problematic.

4.  **Output Format:** Provide your analysis in the following format:

        Sentiment Score: {sentiment_score}

    Problematic Phrases:

    - "{phrase1}": {reason1}
    - "{phrase2}": {reason2}
    - ...

    Overall Assessment: {overall_assessment}
    
    *   '{sentiment_score}': The overall sentiment score (-1 to 1).
    *   '{phrase1}', '{phrase2}', etc.: Specific phrases identified as problematic.
    *   '{reason1}', '{reason2}', etc.: Explanation of why the phrase is problematic (e.g., "uses negative language," "is ambiguous," "could be interpreted as sarcastic").
    *   '{overall_assessment}': A brief summary of the overall sentiment and potential issues.

Now, analyze the provided Pull Request Description and Comments and provide your analysis in the specified format.`;
async function run() {
  try {
    const key = core.getInput('gemini_api_key');
    const token = core.getInput('service_token');
    const ctx = { repoName: process.env.GITHUB_REPOSITORY || '', event: process.env.GITHUB_EVENT_NAME || '' };
    try { Object.assign(ctx, JSON.parse(fs.readFileSync('package.json', 'utf8'))); } catch {}
    let prompt = PROMPT;
    for (const [k, v] of Object.entries(ctx)) prompt = prompt.replace(new RegExp('{' + k + '}', 'g'), String(v || ''));
    let result;
    if (key) {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 2000 } })
      });
      result = (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (token) {
      const r = await fetch('https://action-factory.walshd1.workers.dev/generate/pr-sentiment-analyzer', {
        method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx)
      });
      result = (await r.json()).content || '';
    } else throw new Error('Need gemini_api_key or service_token');
    console.log(result);
    core.setOutput('result', result);
  } catch (e) { core.setFailed(e.message); }
}
run();
