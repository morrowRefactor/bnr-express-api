const TagsService = {
    getAllTags(knex) {
        return knex.select('*').from('tags')
    },
    insertTag(knex, newTag) {
        return knex
            .insert(newTag)
            .into('tags')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
       return knex.from('tags').select('*').where('id', id).first()
    },
    deleteTag(knex, id) {
        return knex('tags')
            .where({ id })
            .delete()
    },
    updateTag(knex, id, newTagFields) {
        return knex('tags')
            .where({ id })
            .update(newTagFields)
    },
};

module.exports = TagsService;