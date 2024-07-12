const redis = require('redis');
const {REDIS_URL} = process.env;
const client = redis.createClient(REDIS_URL);
// SET mykey 0 EX 10 NX

const Config = {
    time: 30,
    count: 7
};

client.on('error', err => console.log(`Error ${err}`))

const rateLimiter = ()  => (req, res, next) => {
    const token = req.user_id || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    client
        .multi() // starting a transaction
        .set([token, 0, 'EX', Config.time, 'NX']) /*NX:  Only set the key if it does not already exist*/
        .incr(token)
        .exec((err, replies) => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    message: err.message
                })
            }
            const reqCount = replies[1]
            if (reqCount > Config.count) {
                return res
                    .status(403)
                    .json({
                        status: 'error',
                        message: `You are limited.`
                    })
            }
            return next()
        })
}

module.exports = { rateLimiter }