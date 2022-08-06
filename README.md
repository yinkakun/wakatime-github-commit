# Wakatime Stats Github Commit

Auto commit your daily total time tracked on Wakatime to Github. Using Netlify Scheduled Functions, Github GraphQL API, and Wakatime API.

## Setup

1. Fork this repository.

2. You'll need a [WakaTime API Key](https://wakatime.com/settings/api-key), which you can get from your WakaTime Account Settings. Store the token somewhere secure, we'll need it shortly.

3. You'll need a GitHub Personal Access Token with `repo` and `admin:repo_hook` scope which can be generated [here](https://github.com/settings/tokens). Store the token somewhere secure, we'll need it shortly.

4. Import Repo to Netlify - Go to the [Netlify Dashboard page](https://app.netlify.com), Click the `Add New Site` > `Import An Existing Project` > `GitHub` button. Authorize the app to access your GitHub account then choose the cloned repo. Add required environment variables, Click the `Show Advanced` > `New Variable` button. Add these variables:

```env
WAKATIME_API_KEY=<your-wakatime-api-key>
GITHUB_ACCESS_TOKEN=<your-github-access-token>
REPO_NAME=<the-cloned-repo-name>
GITHUB_USERNAME=<your-github-username>
```

Then click the `Deploy Site` button. Go to the `Functions` tab of the dashboard and click the `Enable Scheduled Functions` button. After a few seconds, your function should be successfully deployed.

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

- Filter duplicate dates
