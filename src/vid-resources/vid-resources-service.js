const VidResourcesService = {
    getAllVidResources(knex) {
        return knex.select('*').from('vid_resources')
    },
    insertVidResource(knex, newVidRes) {
        return knex
            .insert(newVidRes)
            .into('vid_resources')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
       return knex.from('vid_resources').select('*').where('id', id).first()
    },
    deleteVidResource(knex, id) {
        return knex('vid_resources')
            .where({ id })
            .delete()
    },
    updateVidResource(knex, id, newVidResFields) {
        return knex('vid_resources')
            .where({ id })
            .update(newVidResFields)
    },
};

module.exports = VidResourcesService;