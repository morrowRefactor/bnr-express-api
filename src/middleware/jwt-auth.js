const AuthService = require('../auth/auth-service');
const config = require('../config');

function getBearerToken(req) {
    const authToken = req.get('Authorization') || '';
    if (!authToken.toLowerCase().startsWith('bearer ')) return null;
    return authToken.slice(7, authToken.length);
};

function requireAuth(req, res, next) {
    const bearerToken = getBearerToken(req);
    if (!bearerToken) {
       return res.status(401).json({ error: 'Missing bearer token' });
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken);

        AuthService.getUserWithUserEmail(
            req.app.get('db'),
            payload.sub,
        )
        .then(user => {
            if (!user)
            return res.status(401).json({ error: 'Unauthorized request' });

            req.user = user;
            next()
        })
        .catch(err => {
            console.error(err)
            next(err)
        })
    } catch(error) {
        res.status(401).json({ error: 'Unauthorized request' });
    }
};

// Like requireAuth, but lets the request through without a user when no valid token is sent
function optionalAuth(req, res, next) {
    const bearerToken = getBearerToken(req);
    if (!bearerToken) return next();

    let payload;
    try {
        payload = AuthService.verifyJwt(bearerToken);
    } catch(error) {
        return next();
    }

    AuthService.getUserWithUserEmail(req.app.get('db'), payload.sub)
        .then(user => {
            if (user) req.user = user;
            next()
        })
        .catch(next)
};

function isAdmin(user) {
    return !!user && config.ADMIN_USER_IDS.includes(user.id);
};

// Must run after requireAuth
function requireAdmin(req, res, next) {
    if (!isAdmin(req.user)) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next()
};

module.exports = {
    requireAuth,
    optionalAuth,
    requireAdmin,
    isAdmin,
};
