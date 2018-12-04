
-- ---------
-- ---------
-- ---------
DROP VIEW IF EXISTS insit.inscritos CASCADE;
CREATE VIEW insit.inscritos AS 
WITH 
logins  AS (SELECT uf, 
					CASE WHEN sexo = '1' OR sexo ='Masculino' THEN '1' 
						 WHEN sexo = '2' OR sexo ='Feminino' THEN '2' 
						 ELSE '0' END AS sexo,
					CASE WHEN raca = 'BRANCA' THEN 'BRANCA'	
					     WHEN raca = 'PRETA' THEN 'PRETA'	
						 WHEN raca = 'AMARELA' THEN 'AMARELA'	
						 WHEN raca = 'PARDA' THEN 'PARDA'	
						 WHEN raca = 'INDIGENA' THEN 'INDIGENA'
						ELSE 'N / D' END AS raca
			FROM  public.idjovem_login),

racas   AS (SELECT DISTINCT raca FROM logins), 
sexos   AS (SELECT DISTINCT sexo FROM logins), 
estados AS (SELECT DISTINCT uf FROM logins),
tabela  AS (SELECT * FROM estados, sexos, racas),
counts  AS (SELECT *, COUNT(*) AS inscritos FROM logins GROUP BY uf, sexo, raca)

SELECT uf, sexo, raca, COALESCE(inscritos,0) AS inscritos 
FROM tabela 
NATURAL FULL JOIN counts
ORDER BY uf, sexo, raca;


-- ---------
-- ---------
-- ---------
DROP VIEW IF EXISTS insit.event_count; 
CREATE VIEW insit.event_count AS 

WITH totals AS 
(SELECT uf AS sigla, SUM(inscritos) AS event_count 
FROM insit.inscritos
GROUP BY uf
ORDER BY uf)

SELECT *, row_number() OVER () AS eventtype_order FROM totals NATURAL JOIN insit.estados;



-- ---------
-- ---------
-- ---------
DROP VIEW IF EXISTS insit.adesao CASCADE;
CREATE VIEW insit.adesao AS 
WITH totals AS (
	SELECT 	uf, 
			sexo, 
			raca, 
			SUM(inscritos) AS inscritos,
			SUM(total) AS total 
	FROM insit.resumes NATURAL FULL JOIN insit.inscritos
	GROUP BY uf, sexo, raca)

SELECT *, 100*(inscritos / total) AS adesao 
FROM insit.inscritos 
NATURAL FULL JOIN totals
WHERE uf != '' AND sexo != '0';



-- ---------
-- ---------
-- ---------
DROP VIEW IF EXISTS insit.status;
CREATE VIEW insit.status AS 
WITH base AS 
(SELECT a.aspect_id, a.aspect_desc, a.aspect_order, a.icon, a.route, a.sexo, a.sexo_desc, a.raca, 
		u.org_id, u.org_name, u.org_sigla, u.org_order, u.url, u.chief, u.org_type, u.parent_org_id, u.org_sigla AS uf, 
		TRUE AS has_aspect
FROM insit.org u, insit.aspects a),

totals AS 
(SELECT uf, sexo, 
		'TOTAL'::VARCHAR AS raca,
		SUM(inscritos) AS inscritos, 
		SUM(total) AS total, 
		10000*(SUM(inscritos) / SUM(total)) AS adesao
FROM insit.adesao
GROUP BY uf, sexo),

grades AS 
(SELECT * FROM insit.adesao 
UNION ALL 
SELECT * FROM totals)

SELECT * 
FROM base NATURAL JOIN grades 
LEFT JOIN insit.scales ON scales.grade = trunc(adesao)
WHERE org_id IS NOT NULL;