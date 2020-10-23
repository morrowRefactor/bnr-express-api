const AuthService = require('./auth-service')

function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';

  let basicToken
  if (!authToken.toLowerCase().startsWith('basic ')) {
    return res.status(401).json({ error: 'Unauthorized request' })
  } else {
    basicToken = authToken.slice('Basic '.length, authToken.length)
  }

  const [tokenUserName, tokenPassword] = AuthService.parseBasicToken(basicToken);

  if (!tokenUserName || !tokenPassword) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }

  AuthService.getUserWithUserName(
    req.app.get('db'),
    tokenUserName
  )
    .then(user => {
      console.log('user', user)
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized request' })
      }

      if (user.password !== tokenPassword) {
        return res.status(401).json({ error: 'Unauthorized request' })
      }

      else {
        req.user = user
          next()
      }
      /*
      return AuthService.comparePasswords(tokenPassword, user.password)
        .then(passwordsMatch => {
          if (!passwordsMatch) {
            return res.status(401).json({ error: 'Unauthorized request' })
          }

          req.user = user
          next()
        })*/
    })
    .catch(next)
}

module.exports = {
  requireAuth,
}