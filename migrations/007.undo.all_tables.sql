ALTER TABLE comments
    DROP COLUMN uid;

DROP TABLE IF EXISTS users; 

ALTER TABLE vid_tags
    DROP COLUMN tag_id;

DROP TABLE IF EXISTS tags; 

ALTER TABLE vid_tags
    DROP COLUMN vid_id;

ALTER TABLE vid_resources
    DROP COLUMN vid_id;

ALTER TABLE comments
    DROP COLUMN vid;

DROP TABLE IF EXISTS videos; 

DROP TABLE IF EXISTS vid_tags; 

DROP TABLE IF EXISTS vid_resources; 

DROP TABLE IF EXISTS comments; 

DROP TABLE IF EXISTS schemaversion;