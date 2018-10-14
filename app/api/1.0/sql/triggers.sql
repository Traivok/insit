CREATE OR REPLACE FUNCTION insert_geo_eventtypes() RETURNS trigger 
	AS $BODY$
BEGIN
	INSERT INTO geo_eventtypes(geo_id,eventtype_id,enabled)
	SELECT NEW.geo_id, eventtype_id, FALSE FROM eventtypes;
    RETURN NEW;
END;
$BODY$
	LANGUAGE plpgsql
	COST 100
	CALLED ON NULL INPUT
	SECURITY INVOKER
	VOLATILE;

DROP TRIGGER insert_geo_eventtypes ON geo; 
CREATE TRIGGER insert_geo_eventtypes 
	AFTER INSERT ON geo 
	FOR EACH ROW EXECUTE PROCEDURE insert_geo_eventtypes();



CREATE OR REPLACE FUNCTION insert_eventtype_eventtypes() RETURNS trigger 
	AS $BODY$
BEGIN
	INSERT INTO geo_eventtypes(geo_id,eventtype_id,enabled)
	SELECT geo_id, NEW.eventtype_id, FALSE FROM geo;
    RETURN NEW;
END;
$BODY$
	LANGUAGE plpgsql
	COST 100
	CALLED ON NULL INPUT
	SECURITY INVOKER
	VOLATILE;

DROP TRIGGER insert_eventtype_eventtypes ON eventtypes; 
CREATE TRIGGER insert_eventtype_eventtypes 
	AFTER INSERT ON eventtypes 
	FOR EACH ROW EXECUTE PROCEDURE insert_eventtype_eventtypes();
    
    
--    
--    
DROP FUNCTION randomPoint(bigint);
CREATE OR REPLACE FUNCTION randomPoint(IN g_id int8, OUT lon FLOAT, OUT lat FLOAT ) 
RETURNS RECORD 
	AS $BODY$ 
DECLARE 
-- 	q record;
	i INTEGER := 0;
	x0 DOUBLE PRECISION;
	dx DOUBLE PRECISION; 
	y0 DOUBLE PRECISION;
	dy DOUBLE PRECISION;
	xp DOUBLE PRECISION;
	yp DOUBLE PRECISION;
	rpoint Geometry;
	the_geom Geometry;
BEGIN
	SELECT INTO the_geom geom_3857 FROM geo WHERE geo.geo_id=g_id;

	 -- find envelope
	 x0 = ST_XMin(the_geom);
	 dx = (ST_XMax(the_geom) - x0);
	 y0 = ST_YMin(the_geom);
	 dy = (ST_YMax(the_geom) - y0);
  
	WHILE i < 10000 LOOP
		i = i + 1;
		xp = x0 + dx * random();
		yp = y0 + dy * random();

		rpoint = ST_SetSRID( ST_MakePoint( xp, yp ), ST_SRID(the_geom) );
		EXIT WHEN ST_Within( rpoint, the_geom );
	END LOOP;
  

	IF i >= 10000 THEN
		RAISE EXCEPTION 'RandomPoint: number of interations exceeded ';
	END IF;
  
	lon = ST_X(ST_Transform(rpoint,4326)); 
	lat = ST_Y(ST_Transform(rpoint,4326)); 

-- 	SELECT 	ST_X(ST_Transform(rpoint,4326)), 
-- 			ST_Y(ST_Transform(rpoint,4326)) INTO q; 
-- 
-- 	RETURN q;
END;
$BODY$
	LANGUAGE plpgsql
	COST 100
	CALLED ON NULL INPUT
	SECURITY INVOKER
	VOLATILE;

-- ---------------------------------------------
-- ---------------------------------------------
-- ---------------------------------------------
DROP FUNCTION findWhere(float, float);
CREATE OR REPLACE FUNCTION findWhere(IN lon FLOAT, IN lat FLOAT) 
RETURNS BIGINT
	AS $BODY$ 
DECLARE
	g_loc	Geometry;
	g_id	BIGINT;
BEGIN
	g_loc = ST_SetSRID(ST_MakePoint(lon,lat),3857);

	SELECT geo_id INTO g_id FROM geo 
	WHERE ST_Contains(geom_3857, g_loc) AND reg_id IS NOT NULL
	LIMIT 1;

	RETURN g_id;
END;
$BODY$
	LANGUAGE plpgsql
	COST 100
	CALLED ON NULL INPUT
	SECURITY INVOKER
	VOLATILE;


CREATE OR REPLACE FUNCTION insert_events() RETURNS trigger 
	AS $BODY$
DECLARE 
	pos 	RECORD;
	rpoint Geometry;    
BEGIN
	IF NEW.geo_id IS NULL THEN
		NEW.geo_id = findWhere(NEW.lon,NEW.lat); 
        
        rpoint = ST_Transform(ST_SetSRID(ST_MakePoint(NEW.lon,NEW.lat),3857),4326);

        NEW.lon = ST_X(rpoint);
        NEW.lat = ST_Y(rpoint);
	ELSE
		SELECT * INTO NEW.lon, NEW.lat FROM randomPoint(NEW.geo_id);
	END IF;

	RETURN NEW;
END;
$BODY$
	LANGUAGE plpgsql
	COST 100
	CALLED ON NULL INPUT
	SECURITY INVOKER
	VOLATILE;

