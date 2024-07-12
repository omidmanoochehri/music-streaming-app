const JWT = require('jsonwebtoken');
module.exports = (req, res, next) => {
    const Token = req.get('Token');
    if(!Token){
        return res.status(401).json({
            status: 'error',
            message: 'Please send Token in header.'
        });
    }else
        try{
            const {user_id} = JWT.verify(Token, process.env.SECRET);
            req.user_id = user_id;
            next();
        } catch(err){
            res.status(403).json({
                status: 'error',
                message: 'Token is not valid.'
            });
        }
};