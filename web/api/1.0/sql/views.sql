--
--
DROP VIEW IF EXISTS status CASCADE;
CREATE VIEW status AS 
WITH base AS (
	SELECT *, EXISTS (SELECT 1 FROM grades WHERE (org_id,aspect_id)=(u.org_id,a.aspect_id) LIMIT 1) AS has_aspect 
	FROM org u, aspects a)

SELECT * FROM base 
LEFT JOIN grades USING(org_id,aspect_id)
LEFT JOIN scales USING (grade);

--
--
DROP VIEW IF EXISTS geo_data CASCADE;
CREATE VIEW geo_data AS
SELECT geo_id, geo_name, geo_order, subprefeitura FROM geo WHERE reg_id IS NULL;

--
--
DROP VIEW IF EXISTS geo_bairros CASCADE;
CREATE VIEW geo_bairros AS
SELECT geo_id, geo_name, reg_id AS parent_id FROM geo WHERE reg_id IS NOT NULL;

--
--
DROP VIEW IF EXISTS dtb CASCADE;
CREATE VIEW dtb AS 
WITH regadms AS (
SELECT g.geo_id, g.geo_name, g.subprefeitura, g.geo_order, g.bbox,
	json_agg ( json_build_object ('geo_id', h.geo_id, 'geo_name', h.geo_name ) ORDER BY h.geo_name )  AS bairros 
FROM geo g  
JOIN geo h ON (g.geo_id = h.reg_id) 
GROUP BY g.geo_id, g.geo_name, g.subprefeitura, g.geo_order, g.bbox)

SELECT 	subprefeitura, 
		json_agg (json_build_object('geo_id', geo_id, 'geo_name', geo_name, 'order', geo_order, 'bbox', bbox, 'bairros', bairros ) ORDER BY geo_name ) AS regadms 
FROM regadms 
GROUP BY subprefeitura 
ORDER BY subprefeitura;


--
--
DROP VIEW IF EXISTS event_count CASCADE;
CREATE VIEW event_count AS  
WITH geo_counts AS (
    SELECT  events.geo_id,
            events.eventtype_id,
            count(*) AS event_count,
            max(events.severity_id) AS severity_id
    FROM events
    GROUP BY events.geo_id, events.eventtype_id), 
    
    dtb_counts AS (
    SELECT geo.reg_id AS geo_id,
        gc.eventtype_id,
        sum(gc.event_count) AS event_count,
        max(gc.severity_id) AS severity_id
    FROM (geo_counts gc
    JOIN geo USING (geo_id))
    GROUP BY geo.reg_id, gc.eventtype_id), 
    
    all_counts AS (
    SELECT geo_counts.geo_id,
        geo_counts.eventtype_id,
        geo_counts.event_count,
        geo_counts.severity_id
    FROM geo_counts
    UNION ALL
    SELECT dtb_counts.geo_id,
        dtb_counts.eventtype_id,
        dtb_counts.event_count,
        dtb_counts.severity_id
    FROM dtb_counts)
    
SELECT e.eventtype_id,
    e.eventtype_desc,
    e.eventtype_order,
    e.icon,
    et.geo_id,
    et.enabled,
	sev.*,
    (COALESCE(ac.event_count, (0)::numeric))::integer AS event_count
FROM eventtypes_geo et
JOIN eventtypes e USING (eventtype_id)
LEFT JOIN all_counts ac USING (geo_id, eventtype_id)
LEFT JOIN severities sev USING (severity_id);



--
--
DROP VIEW IF EXISTS event_geom CASCADE;
CREATE VIEW event_geom AS 
SELECT  event_id, created_at, 
		eventtype_id, eventtype_desc,
		eventstatus_id, eventstatus_desc, marker,
        severity_id,
        lat, lon, geo_id
FROM events 
JOIN eventtypes USING (eventtype_id)
JOIN eventstatus USING (eventstatus_id)
JOIN severities USING (severity_id);

--
--
DROP VIEW IF EXISTS geo_geom CASCADE;
CREATE VIEW geo_geom AS 
SELECT  geo_id, 
		geo_name, 
		geom_geojson AS geometry, 
		(reg_id IS NOT NULL) AS is_child
FROM geo;


--
--
DROP VIEW IF EXISTS geo_colors CASCADE;
CREATE VIEW geo_colors AS

WITH 
open_events AS 
	(SELECT * FROM events WHERE eventstatus_id IN (0,1,2,3,5)),

base AS 
	(SELECT geo_id, eventtype_id, COALESCE(MAX(severity_id),0) AS severity_id
	FROM eventtypes_geo 
	LEFT JOIN open_events USING (geo_id, eventtype_id)
	GROUP BY geo_id, eventtype_id)

SELECT geo_id, eventtype_id, severity_id, severity_color 
FROM base 
JOIN severities USING(severity_id);
