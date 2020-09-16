const VidTagsService = {
    getAllVidTags(knex) {
        return knex.select('*').from('vid_tags')
    },
    insertVidTag(knex, newVidTag) {
        return knex
            .insert(newVidTag)
            .into('vid_tags')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
       return knex.from('vid_tags').select('*').where('id', id).first()
    },
    deleteVidTag(knex, id) {
        return knex('vid_tags')
            .where({ id })
            .delete()
    },
    updateVidTag(knex, id, newVidTagFields) {
        return knex('vid_tags')
            .where({ id })
            .update(newVidTagFields)
    },
};

module.exports = VidTagsService;