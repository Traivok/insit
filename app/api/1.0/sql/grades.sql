-- ------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION accept_answer() RETURNS trigger 
	AS $BODY$
DECLARE 
	q record;
BEGIN

-- RAISE LOG 'ACCEPT ANSWER BEFORE - fill_id: %, question_id: %, answer_id: %', NEW.fill_id, NEW.question_id, NEW.answer_id;

	-- EVAL answer's ACCEPTED state
	SELECT INTO q *
	FROM questions
	WHERE question_id = NEW.question_id; 


	CASE 
		WHEN q.unit_id = 1 AND NEW.value_bool   IS NULL THEN NEW.accepted = FALSE; RETURN NEW;
		WHEN q.unit_id = 2 AND NEW.value_number IS NULL THEN NEW.accepted = FALSE; RETURN NEW;
		WHEN q.unit_id = 3 AND NEW.value_tstamp IS NULL THEN NEW.accepted = FALSE; RETURN NEW;
		ELSE NEW.accepted = FALSE; RETURN NEW;
	END CASE;



	CASE q.unit_id
		WHEN 1 THEN		-- Boolean
			CASE q.criterium_id WHEN 0 THEN
				NEW.accepted = NEW.value_bool;
			ELSE
				NEW.accepted = (NEW.value_bool AND q.criterium_id=1) OR (NOT NEW.value_bool AND q.criterium_id=2);
			END CASE;

		WHEN 2 THEN
			CASE q.criterium_id 
				WHEN  3 THEN NEW.accepted = (NEW.value_number =  q.number_ref);
				WHEN  4 THEN NEW.accepted = (NEW.value_number != q.number_ref); 
				WHEN  5 THEN NEW.accepted = (NEW.value_number <  q.number_ref);
				WHEN  6 THEN NEW.accepted = (NEW.value_number >  q.number_ref);
				WHEN  7 THEN NEW.accepted = (NEW.value_number <= q.number_ref);
				WHEN  8 THEN NEW.accepted = (NEW.value_number >= q.number_ref);
				WHEN  9 THEN NEW.accepted = (NEW.value_number     BETWEEN q.number_ref AND q.number_upper);
				WHEN 10 THEN NEW.accepted = (NEW.value_number NOT BETWEEN q.number_ref AND q.number_upper);
				ELSE NEW.accepted  = FALSE;
			END CASE;

		WHEN 3 THEN
			CASE q.criterium_id 
				WHEN  3 THEN NEW.accepted = (NEW.value_tstamp =  q.tstamp_ref);
				WHEN  4 THEN NEW.accepted = (NEW.value_tstamp != q.tstamp_ref);
				WHEN  5 THEN NEW.accepted = (NEW.value_tstamp <  q.tstamp_ref);
				WHEN  6 THEN NEW.accepted = (NEW.value_tstamp >  q.tstamp_ref);
				WHEN  7 THEN NEW.accepted = (NEW.value_tstamp <= q.tstamp_ref);
				WHEN  8 THEN NEW.accepted = (NEW.value_tstamp >= q.tstamp_ref);
				WHEN  9 THEN NEW.accepted = (NEW.value_tstamp     BETWEEN q.tstamp_ref AND q.tstamp_upper);
				WHEN 10 THEN NEW.accepted = (NEW.value_tstamp NOT BETWEEN q.tstamp_ref AND q.tstamp_upper);
				ELSE NEW.accepted  = FALSE;
			END CASE;

	
		WHEN 4 THEN
			NEW.accepted = (NEW.value_image IS NOT NULL);
	
		ELSE NEW.accepted  = FALSE;
	END CASE;
    RETURN NEW;
END;
$BODY$
	LANGUAGE plpgsql
	COST 100
	CALLED ON NULL INPUT
	SECURITY INVOKER
	VOLATILE;

DROP TRIGGER accept_answer ON answers; 
CREATE TRIGGER accept_answer 
	BEFORE INSERT OR UPDATE OF recalc, value_bool, value_number, value_tstamp ON answers 
	FOR EACH ROW EXECUTE PROCEDURE accept_answer();
    
    
    
-- ------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION accept_answer_after() RETURNS trigger 
	AS $BODY$
BEGIN
-- 	RAISE LOG 'ACCEPT ANSWER AFTER - fill_id: %, question_id: %, answer_id: %', NEW.fill_id, NEW.question_id, NEW.answer_id;

	UPDATE fills SET recalc=recalc+1 WHERE fill_id=NEW.fill_id;
    RETURN NEW;
END;
$BODY$
	LANGUAGE plpgsql
	COST 100
	CALLED ON NULL INPUT
	SECURITY INVOKER
	VOLATILE;

DROP TRIGGER accept_answer_after ON answers; 
CREATE TRIGGER accept_answer_after 
	AFTER INSERT OR UPDATE OF recalc, value_bool, value_number, value_tstamp ON answers 
	FOR EACH ROW EXECUTE PROCEDURE accept_answer_after();



    
-- ------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION accept_question() RETURNS trigger 
	AS $BODY$
BEGIN
-- 	RAISE LOG 'ACCEPT QUESTION AFTER - question_id: %', NEW.question_id;
	UPDATE answers SET recalc = recalc+1 WHERE question_id = NEW.question_id;
    RETURN NULL;
END;
$BODY$
	LANGUAGE plpgsql
	COST 100
	CALLED ON NULL INPUT
	SECURITY INVOKER
	VOLATILE;


DROP TRIGGER accept_question ON questions; 
CREATE TRIGGER accept_question 
	AFTER UPDATE OF criterium_id, mandatory, weight, number_ref, number_upper, tstamp_ref, tstamp_upper ON questions 
	FOR EACH ROW EXECUTE PROCEDURE accept_question();
    
    
-- ------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION accept_fill() RETURNS trigger 
	AS $BODY$
DECLARE 
	q record;
BEGIN
-- 	RAISE LOG 'ACCEPT FILL AFTER - fill_id: %', NEW.fill_id;

	SELECT INTO q
		bool_and(CASE mandatory WHEN TRUE THEN accepted ELSE TRUE END) AS accepted,
		ROUND(10*(SUM(weight*accepted::INTEGER) / SUM(weight))) AS grade
	FROM answers JOIN questions USING(question_id)
	WHERE fill_id = NEW.fill_id
	GROUP BY fill_id;

	NEW.grade = q.grade;
	NEW.accepted = q.accepted;
    RETURN NEW;
END;
$BODY$
	LANGUAGE plpgsql
	COST 100
	CALLED ON NULL INPUT
	SECURITY INVOKER
	VOLATILE;


DROP TRIGGER accept_fill ON fills; 
CREATE TRIGGER accept_fill 
	BEFORE UPDATE OF recalc ON fills 
	FOR EACH ROW EXECUTE PROCEDURE accept_fill();    