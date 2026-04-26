# PR Sentiment Analyzer

Analyzes the sentiment of a pull request description and comments to flag potentially negative or confusing language.

## Free
```yaml
- uses: walshd1/pr-sentiment-analyzer@v1
  with:
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
```

## Paid (cost + 4.75%)
```yaml
- uses: walshd1/pr-sentiment-analyzer@v1
  with:
    service_token: ${{ secrets.ACTION_FACTORY_TOKEN }}
```
