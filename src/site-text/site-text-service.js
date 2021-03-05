const SiteTextService = {
    getAllSiteText(knex) {
        return knex.select('*').from('site_text')
    },
    insertSiteText(knex, newText) {
        return knex
            .insert(newText)
            .into('site_text')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
       return knex.from('site_text').select('*').where('id', id).first()
    },
    deleteSiteText(knex, id) {
        return knex('site_text')
            .where({ id })
            .delete()
    },
    updateSiteText(knex, id, newTextFields) {
        return knex('site_text')
            .where({ id })
            .update(newTextFields)
    },
};

module.exports = SiteTextService;