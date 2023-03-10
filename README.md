# Enterprise License Audit Action

Action that returns license counts for GitHub Enterprises.

## Usage

```yaml
uses: oss-tooling/gh-license-audit-action@v1
with:
  enterprise: <name-of-your-enterprise>
```

## Inputs

* `enterprise`: the GitHub enterprise to audit
* `token`: a Personal Access Token scoped with `read:enterprise` permissions

## Outputs

* `total-seats-purchased`: the count of purchased seats
* `total-seats-consumed`: the count of seats consumed
* `dot-com-users`: the count of dot com users
* `server-users`: the count of server users
* `visual-studio-users`: the count of visual studio users
* `duplicates`: the count of users on both server and dot com
* `total-users`: the count of users
* `total-accounts`: the count of accounts


## Examples

Reference implementations:

* [Check license usage nightly and report out in a GitHub repo](./examples/nightly-license-audit.yml)
