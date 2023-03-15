
const { Octokit } = require("@octokit/rest");
const core = require('@actions/core');
const { retry } = require('@octokit/plugin-retry')
const { throttling } = require('@octokit/plugin-throttling')

const _Octokit = Octokit.plugin(retry, throttling)

const login = async () => {
  const client = new _Octokit({
    auth: core.getInput('token', {required: true}),
    throttle: {
      onRateLimit: (retryAfter, options) => {
        octokit.log.warn(
          `Request quota exhausted for request ${options.method} ${options.url}`
        );
  
        // Retry twice after hitting a rate limit error, then give up
        if (options.request.retryCount <= 2) {
          console.log(`Retrying after ${retryAfter} seconds!`);
          return true;
        }
      },
      onSecondaryRateLimit: (retryAfter, options, octokit) => {
        // does not retry, only logs a warning
        octokit.log.warn(
          `Secondary quota detected for request ${options.method} ${options.url}`
        );
      }},
  });

  const advancedSecurityPromise = client.request('GET /enterprises/{enterprise}/settings/billing/advanced-security', {
    enterprise: core.getInput('enterprise'),
  })

  const licensePromise = client.paginate('GET /enterprises/{enterprise}/consumed-licenses', {
    enterprise: core.getInput('enterprise'),
    per_page: 100
  })

  const [advancedSecurity, licenses] = await Promise.all([advancedSecurityPromise, licensePromise])

  let dotcomUsers = 0
  let serverUsers = 0
  let visualStudioUsers = 0
  let duplicates = 0
  let accounts = 0

  for (const batch of licenses) {
      for (const user of batch.users) {
          if (user.github_com_user) {
              dotcomUsers++
          }
          if (user.enterprise_server_user) {
              serverUsers++
          }
          if (user.visual_studio_subscription_user) {
              visualStudioUsers++
          }
          if (user.github_com_user && user.enterprise_server_user) {
              duplicates++
          }
          accounts += user.total_user_accounts
      }
  }

  core.setOutput('total-seats-purchased', licenses[0].total_seats_purchased)
  core.setOutput('total-seats-consumed', licenses[0].total_seats_consumed)
  core.setOutput('dot-com-users', dotcomUsers)
  core.setOutput('server-users', serverUsers)
  core.setOutput('visual-studio-users', visualStudioUsers)
  core.setOutput('duplicates', duplicates)
  core.setOutput('total-users', dotcomUsers + serverUsers - duplicates)
  core.setOutput('total-accounts', accounts)
  core.setOutput('total-advanced-security-committers', advancedSecurity.data.total_advanced_security_committers)
  core.setOutput('total-advanced-security-seats', advancedSecurity.data.total_count)
}

login()

