// Optional: load into Neo4j 5+ when running docker compose for production demo
// docker run -p7474:7474 -p7687:7687 -e NEO4J_AUTH=neo4j/cascade2026 neo4j:5

CREATE CONSTRAINT variation_id IF NOT EXISTS FOR (v:Variation) REQUIRE v.id IS UNIQUE;

MERGE (v:Variation {id: 'V-2026-017'})
SET v.title = 'Lobby size increase 20%', v.total_items = 263;

MERGE (f:Cluster {id: 'finishes'}) SET f.label = 'Finishes', f.count = 3;
MERGE (r:Cluster {id: 'reinforcement'}) SET r.label = 'Reinforcement', r.count = 4;
MERGE (m:Cluster {id: 'mep'}) SET m.label = 'MEP', m.count = 11;
MERGE (d:Cluster {id: 'doors_frames'}) SET d.label = 'Doors/Frames', d.count = 2;
MERGE (w:Cluster {id: 'formwork'}) SET w.label = 'Formwork', w.count = 4;
MERGE (c:Cluster {id: 'columns'}) SET c.label = 'Columns', c.count = 4;

MERGE (v)-[:AFFECTS {hop: 1}]->(f);
MERGE (v)-[:AFFECTS {hop: 1}]->(r);
MERGE (v)-[:AFFECTS {hop: 1}]->(m);
MERGE (v)-[:AFFECTS {hop: 1}]->(d);
MERGE (v)-[:AFFECTS {hop: 1}]->(w);
MERGE (v)-[:AFFECTS {hop: 1}]->(c);
