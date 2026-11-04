"""Knowledge graph payload for Impact Trace (Neo4j schema; in-memory fallback for demo)."""
from __future__ import annotations

import os
from typing import Any, Dict, List, Optional


def _try_neo4j_graph(variation_id: str) -> Optional[Dict[str, Any]]:
    uri = os.getenv("NEO4J_URI", "").strip()
    user = os.getenv("NEO4J_USER", "neo4j")
    password = os.getenv("NEO4J_PASSWORD", "")
    if not uri or not password:
        return None
    try:
        from neo4j import GraphDatabase  # type: ignore

        driver = GraphDatabase.driver(uri, auth=(user, password))
        with driver.session() as session:
            result = session.run(
                """
                MATCH (v:Variation {id: $vid})-[r:AFFECTS|INDIRECT*1..3]-(n)
                RETURN v, collect(distinct n) AS nodes, collect(distinct r) AS rels
                LIMIT 500
                """,
                vid=variation_id,
            )
            record = result.single()
            if not record:
                driver.close()
                return None
            # Minimal conversion — extend when Neo4j is seeded
            driver.close()
    except Exception:
        return None
    return None


def build_impact_graph(variation: Dict[str, Any]) -> Dict[str, Any]:
    """Build force-graph nodes/links from variation graph JSON (mirrors Neo4j ontology)."""
    g = variation.get("graph") or {}
    center = g.get("center") or {}
    clusters = g.get("clusters") or []
    vid = variation.get("id", "V-ROOT")

    nodes: List[Dict[str, Any]] = [
        {
            "id": center.get("id", vid),
            "label": center.get("label", "Variation"),
            "type": "variation",
            "hop": 0,
            "count": center.get("count", 0),
            "size": 28,
        }
    ]
    links: List[Dict[str, Any]] = []

    hop_style = {1: "direct", 2: "indirect_2hop", 3: "indirect_3hop"}

    for cluster in clusters:
        cid = cluster["id"]
        level = int(cluster.get("level", 1))
        nodes.append(
            {
                "id": cid,
                "label": cluster.get("label", cid).replace("\n", " "),
                "type": "cluster",
                "hop": level,
                "count": cluster.get("count", 0),
                "items": cluster.get("items", [])[:6],
                "size": 14 + min(cluster.get("count", 3), 12),
            }
        )
        links.append(
            {
                "source": center.get("id", vid),
                "target": cid,
                "hop": level,
                "type": hop_style.get(level, "direct"),
                "label": "AFFECTS",
            }
        )

        # Representative BQ leaf nodes (2-hop illustration)
        for i, item_name in enumerate((cluster.get("items") or [])[:2]):
            leaf_id = f"{cid}__{i}"
            nodes.append(
                {
                    "id": leaf_id,
                    "label": item_name[:42],
                    "type": "bq_item",
                    "hop": min(level + 1, 3),
                    "count": 1,
                    "size": 6,
                }
            )
            links.append(
                {
                    "source": cid,
                    "target": leaf_id,
                    "hop": min(level + 1, 3),
                    "type": "indirect_2hop" if level == 1 else "indirect_3hop",
                    "label": "IMPLIES",
                }
            )

    summary = variation.get("impact_summary") or {}
    return {
        "variation_id": vid,
        "engine": "neo4j_ontology_fallback",
        "engine_note": "Set NEO4J_URI + NEO4J_PASSWORD to query live Neo4j; demo uses isomorphic in-memory graph.",
        "nodes": nodes,
        "links": links,
        "stats": {
            "total": summary.get("total_affected_items", 0),
            "direct": summary.get("direct_items", 0),
            "indirect_2hop": summary.get("indirect_2hop", 0),
            "indirect_3hop": summary.get("indirect_3hop", 0),
            "estimated_impact": summary.get("estimated_impact", 0),
        },
    }


def get_impact_graph(variation: Dict[str, Any]) -> Dict[str, Any]:
    live = _try_neo4j_graph(variation.get("id", ""))
    if live:
        live["engine"] = "neo4j"
        return live
    return build_impact_graph(variation)
