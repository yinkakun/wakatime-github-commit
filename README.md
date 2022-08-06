# Wakatime Stats Github Commit

Auto commit your daily total time tracked on Wakatime to Github. Using Netlify Scheduled Functions, Github GraphQL API, and Wakatime API.

## Setup

1. Fork this repository.

2. You'll need a [WakaTime API Key](https://wakatime.com/settings/api-key), which you can get from your WakaTime Account Settings.

3. You'll need a GitHub Personal Access Token with `repo` and `admin:repo_hook` scope which can be generated [here](https://github.com/settings/tokens).

4. This project uses Netlify [Scheduled Functions](https://ntl.fyi/sched-func) which is currently a beta feature, so you'll need to enable it in [Netlify Labs.](https://app.netlify.com/user/labs) Once you open the Netlify Labs page, click on Enable next to the Scheduled Functions experimental feature.

5. If you don’t already have a Netlify account, you can sign up [here](https://app.netlify.com/signup). Once you've logged in,go to the [Netlify Dashboard](https://app.netlify.com). Click the Add A New Project button.

## Local Development

```bash
# Install the Netlify CLI
npm install -g netlify-cli.

# Login to netlify
netlify login

# Clone the repository and navigate to project directory
git clone

# Start the functions server
netlify functions:serve

# Function will be available at
http://localhost:9999/.netlify/functions/log-tracked-time


# For typescript project, before committing the files, run:
tsc --noEmit
```

TODO

- Tidy up functions
- Proper error handling and http responses
