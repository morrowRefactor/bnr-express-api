ALTER TABLE vid_tags
    DROP COLUMN vid;

ALTER TABLE vid_resources
    DROP COLUMN vid;

ALTER TABLE comments
    DROP COLUMN vid;

DROP TABLE IF EXISTS videos; 