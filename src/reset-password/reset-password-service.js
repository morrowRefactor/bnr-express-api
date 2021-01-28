const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const ResetPasswordService = {
    insertTempPass(knex, newTempPass) {
        return knex
            .insert(newTempPass)
            .into('temp_passwords')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
       return knex.from('temp_passwords').select('*').where('id', id).first()
    },
    deleteTempPass(knex, id) {
        return knex('temp_passwords')
            .where({ id })
            .delete()
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
    comparePasswords(password, hash) {
        return bcrypt.compare(password, hash)
    },
    createJwt(subject, payload) {
        return jwt.sign(payload, config.JWT_SECRET, {
          subject,
          algorithm: 'HS256'
        })
    }
};

module.exports = ResetPasswordService;