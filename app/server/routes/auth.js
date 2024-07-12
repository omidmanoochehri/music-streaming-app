const router = require('express').Router();
const Joi = require('joi');
const JWT = require('jsonwebtoken');

const Auth = require('./../helpers/authChecker');
// const { rateLimiter } = require('./../helpers/rateLimiter');
const UserModel = require('./../models/User');


const LoginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.required()
});

const RegisterSchema = Joi.object({
    username: Joi.string().required()
});

const UpdateUserSchema = Joi.object({
    first_name: Joi.string(),
    last_name: Joi.string(),
    password: Joi.string()
}).optional("first_name", "last_name", "password");


const login = (user, callback) => {
    const { SECRET } = process.env;
    const token = JWT.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 3000), // 30Min
        user_id: user._id
    }, SECRET);
    return callback(token);
}

router.post('/user/edit', Auth, (req, res) => {
    const user_id = req.user_id;
    const { value, error } = UpdateUserSchema.validate(req.body);
    if (!error) {
        UserModel.updateOne({ _id: user_id }, req.body).exec((err, result) => {
            if (err) {
                if (err) return res.status(500).json({
                    status: 'error',
                    message: ':('
                });
            }
            else {
                res.status(200).json({
                    status: 'saved',
                    message: 'User Updated.'
                })
            }
        })
    }
    else {
        console.log(error)
        res.status(400).json({
            status: 'error',
            message: 'Please fill all required fields!'
        })
    }
})

router.get('/user', Auth, (req, res) => {
    UserModel.findOne({ _id: req.user_id }).exec((err, user) => {
        console.log(err, user, req.user_id)
        if (err) {
            res.status(500).json({
                status: 'error',
                message: 'Sorry, an unknown error occurred!'
            })
        }
        else {
            const { username, first_name, last_name, avatar } = user;
            return res.status(200).json({
                status: 'ok',
                user: {
                    username, first_name, last_name, avatar
                }
            });
        }
    })

})

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const { value, error } = LoginSchema.validate(req.body);
    if (!error) {

        UserModel.findOne({ username: username, password: password }).exec((err, user) => {

            // user exists
            if (user) {
                // login
                login(user, (token) => {
                    return res.json({
                        user: {
                            username: username,
                            first_name: user.first_name,
                            last_name: user.last_name
                        },
                        status: 'ok',
                        token
                    });
                })
            }
            else {
                res.status(404).json({
                    status: 'error',
                    message: 'Username or Password not correct.'
                })
            }

        })




    } else {
        res.status(400).json({
            status: 'error',
            message: error.details[0].message
        });
    }

});

module.exports = router;