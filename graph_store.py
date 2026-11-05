"""Knowledge graph payload for Impact Trace (Neo4j schema; in-memory fallback for demo)."""
from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

# Variation pack documents wired into the same ontology as contract knock-on (Neo4j-shaped).
VARIATION_PACK_DOCS: List[Dict[str, Any]] = [
    {
        "id": "doc_ai084",
        "label": "AI-2026-084",
        "filename": "AI-2026-084.pdf",
        "discipline": "Instruction",
        "role": "Architectural instruction — lobby footprint +20% toward Gridline E",
        "is_trigger": True,
        "cluster_ids": ["finishes", "reinforcement", "mep", "doors_frames", "formwork", "columns"],
    },
    {
        "id": "doc_a201",
        "label": "A-201",
        "filename": "A-201_lobby_plan.pdf",
        "discipline": "Drawing",
        "role": "Lobby grid 12.0 × 10.0 m → 120 m² tile scope (takeoff source)",
        "cluster_ids": ["finishes", "formwork", "columns"],
    },
    {
        "id": "doc_bq",
        "label": "BQ 08-12",
        "filename": "BQ_08-12_finishes.pdf",
        "discipline": "BQ",
        "role": "Finishes schedule — baseline rates & line references",
        "cluster_ids": ["finishes", "reinforcement"],
    },
    {
        "id": "doc_claim",
        "label": "VO claim",
        "filename": "VO_CLAIM_017.xlsx",
        "discipline": "Claim",
        "role": "Contractor variation claim lines (GCC 62 review)",
        "cluster_ids": ["finishes"],
    },
    {
        "id": "doc_spec",
        "label": "Spec 23 40 00",
        "filename": "SPC_23_40_00.pdf",
        "discipline": "Spec",
        "role": "Floor finishes specification & material submittals",
        "cluster_ids": ["finishes", "mep"],
    },
    {
        "id": "doc_site",
        "label": "Site checklist",
        "filename": "Site_checklist_28Jul.pdf",
        "discipline": "Site",
        "role": "Milestone walk-down — certifies progress, not m² takeoff",
        "cluster_ids": ["finishes"],
    },
]


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

    for doc in (variation.get("pack_documents") or VARIATION_PACK_DOCS):
        nodes.append(
            {
                "id": doc["id"],
                "label": doc["label"],
                "filename": doc["filename"],
                "discipline": doc["discipline"],
                "role": doc["role"],
                "type": "document",
                "hop": -1,
                "count": len(doc.get("cluster_ids") or []),
                "cluster_ids": doc.get("cluster_ids") or [],
                "is_trigger": bool(doc.get("is_trigger")),
                "size": 12,
            }
        )
        if doc.get("is_trigger"):
            links.append(
                {
                    "source": doc["id"],
                    "target": center.get("id", vid),
                    "hop": 0,
                    "type": "triggers",
                    "label": "TRIGGERS",
                }
            )
        else:
            links.append(
                {
                    "source": doc["id"],
                    "target": center.get("id", vid),
                    "hop": 0,
                    "type": "cites",
                    "label": "CITES",
                }
            )
        for cid in doc.get("cluster_ids") or []:
            links.append(
                {
                    "source": doc["id"],
                    "target": cid,
                    "hop": 1,
                    "type": "supports",
                    "label": "SUPPORTS",
                }
            )

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
    pack_docs = variation.get("pack_documents") or VARIATION_PACK_DOCS
    return {
        "variation_id": vid,
        "engine": "neo4j_ontology_fallback",
        "engine_note": "Set NEO4J_URI + NEO4J_PASSWORD to query live Neo4j; demo uses isomorphic in-memory graph.",
        "documents": pack_docs,
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
        if "documents" not in live:
            live["documents"] = VARIATION_PACK_DOCS
        return live
    return build_impact_graph(variation)
