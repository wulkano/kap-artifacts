const {parse: parseUrl} = require('url')

const got = require('got')
const {send} = require('micro')

const { CIRCLE_TOKEN } = process.env

if (!CIRCLE_TOKEN) {
  throw new Error('Missing CIRCLE_TOKEN env var')
}

module.exports = async function (req, res) {
  const {pathname} = parseUrl(req.url)

  const branch = pathname === '/' ? 'master' : pathname.slice(1)

  const URL = `https://circleci.com/api/v1.1/project/github/wulkano/kap/latest/artifacts?circle-token=${CIRCLE_TOKEN}&branch=${branch}`

  try {
    const data = await got(URL, {json: true})
    const url = data.body[0].url
    res.writeHeader(302, {'Location': url})
    res.end();
  } catch (err) {
    if (err.statusCode === 404) {
      send(res, 404, `Branch not found: ${branch}`)
    } else {
      send(res, res.statusCode, err.message)
    }
  }
}
