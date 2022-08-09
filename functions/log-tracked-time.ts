require('dotenv').config();
import { readFileSync } from 'fs';
import { WakaTimeClient } from 'wakatime-client';
import { GraphQLClient, gql } from 'graphql-request';
import { format, intervalToDuration } from 'date-fns';
import { HandlerEvent } from '@netlify/functions';

const TODAY_DATE = new Date();
const REPO_NAME = process.env.REPO_NAME;
const TIME_TRACKED_FILE_PATH = 'time-tracked.json';
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const WAKATIME_API_KEY = process.env.WAKATIME_API_KEY;
const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

const wakatimeClient = new WakaTimeClient(WAKATIME_API_KEY);
const githubClient = new GraphQLClient(GITHUB_GRAPHQL_URL, {
  headers: { authorization: `Bearer ${GITHUB_ACCESS_TOKEN}` },
});

const repoInfoQuery = gql`
  query Repo($owner: String!, $repo: String!) {
    repository(name: $repo, owner: $owner) {
      defaultBranchRef {
        name
        target {
          ... on Commit {
            history(first: 1) {
              nodes {
                oid
              }
            }
          }
        }
      }
    }
  }
`;

const createCommitMutation = gql`
  mutation CreateCommit(
    $filePath: String!
    $branchName: String!
    $commitMessage: String!
    $repoNameWithOwner: String!
    $encodedContent: Base64String!
    $expectedHeadOid: GitObjectID!
  ) {
    createCommitOnBranch(
      input: {
        expectedHeadOid: $expectedHeadOid
        message: { headline: $commitMessage }
        branch: {
          branchName: $branchName
          repositoryNameWithOwner: $repoNameWithOwner
        }
        fileChanges: {
          additions: [{ path: $filePath, contents: $encodedContent }]
        }
      }
    ) {
      commit {
        url
      }
    }
  }
`;

interface IDuration {
  data: {
    duration: number;
  }[];
  start: string;
  end: string;
}

interface ITotalDuration {
  hrs: number;
  mins: number;
}

const pluralizeMins = (mins: number) => {
  return mins > 1 ? 'mins' : 'min';
};

const pluralizeHrs = (hrs: number) => {
  return hrs > 1 ? 'hrs' : 'hr';
};

const formatDuration = ({ hrs, mins }: ITotalDuration) => {
  if (hrs === 0 && mins === 0) {
    return 'No time tracked';
  }

  if (hrs === 0) {
    return `${mins} ${pluralizeMins(mins)}`;
  }

  if (mins === 0) {
    return `${hrs} ${pluralizeHrs(hrs)}`;
  }

  return `${hrs} ${pluralizeHrs(hrs)}, ${mins} ${pluralizeMins(mins)}`;
};

const httpHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const handler = async (event: HandlerEvent) => {
  if (event.httpMethod == 'OPTIONS') {
    return {
      statusCode: 200,
      headers: httpHeaders,
    };
  }

  try {
    const durations: IDuration = await wakatimeClient.getMyDurations({
      date: TODAY_DATE,
    });

    const totalDurationInSeconds = durations.data.reduce(
      (accumulatedValue, currentValue) =>
        accumulatedValue + currentValue.duration,
      0,
    );

    const formattedTotalDuration = intervalToDuration({
      start: 0,
      end: totalDurationInSeconds * 1000,
    });

    const formattedTodayDate = format(TODAY_DATE, 'PPPP');

    const formattedDuration = formatDuration({
      hrs: formattedTotalDuration.hours || 0,
      mins: formattedTotalDuration.minutes || 0,
    });

    const newTimeTracked = {
      date: formattedTodayDate,
      duration: formattedDuration,
    };

    const oldTimeTracked = readFileSync(`./${TIME_TRACKED_FILE_PATH}`, 'utf8');

    const totalTimeTracked = [...JSON.parse(oldTimeTracked), newTimeTracked];

    const encodeBase64 = (str: string) => Buffer.from(str).toString('base64');

    const repoInfoVariables = {
      owner: GITHUB_USERNAME,
      repo: REPO_NAME,
    };

    const repo = await githubClient.request(repoInfoQuery, repoInfoVariables);

    const branchName = repo.repository.defaultBranchRef.name;
    const headOid =
      repo.repository.defaultBranchRef.target.history.nodes[0].oid;

    const createCommitMutationVariables = {
      branchName: branchName,
      expectedHeadOid: headOid,
      filePath: TIME_TRACKED_FILE_PATH,
      repoNameWithOwner: `${GITHUB_USERNAME}/${REPO_NAME}`,
      commitMessage: `update with time tracked for ${formattedTodayDate}`,
      encodedContent: encodeBase64(JSON.stringify(totalTimeTracked, null, 2)),
    };

    const createCommit = await githubClient.request(
      createCommitMutation,
      createCommitMutationVariables,
    );

    const commitUrl = createCommit.createCommitOnBranch.commit.url;

    return {
      statusCode: 200,
      headers: httpHeaders,
      body: JSON.stringify({
        commitUrl: commitUrl,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: httpHeaders,
      body: JSON.stringify({
        error: err,
      }),
    };
  }
};

export { handler };
