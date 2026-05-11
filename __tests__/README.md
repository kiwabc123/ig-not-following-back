# Testing Guide

This directory contains test files to help debug the Instagram follower analysis.

## Running Tests

```bash
cd __tests__
node test.js
```

## Test Files

- `followers_1.json` - Sample followers data
- `following.json` - Sample following data
- `test.js` - Test runner that verifies the extraction and comparison logic

## Expected Output

The test should show:
- **Followers**: 3 (user1, user2, user3)
- **Following**: 4 (user1, user2, user4, user5)
- **Not Following Back**: 2 (user4, user5)
- **Unfollowed Followers**: 1 (user3)
- **Mutual Follows**: 2 (user1, user2)

## Debugging Your Real Data

If the web app shows incorrect numbers:

1. Export your real Instagram data
2. Replace `followers_1.json` and `following.json` in this directory
3. Run `node test.js`
4. Compare the output with what you see in the web app
5. This will reveal which part of the process is failing

## Instagram Export Format

**followers_1.json** structure:
```json
[
  {
    "string_list_data": [
      {
        "value": "username",
        "href": "https://www.instagram.com/username/"
      }
    ]
  }
]
```

**following.json** structure:
```json
{
  "relationships_following": [
    {
      "title": "username",
      "string_list_data": [
        {
          "href": "https://www.instagram.com/username/"
        }
      ]
    }
  ]
}
```
