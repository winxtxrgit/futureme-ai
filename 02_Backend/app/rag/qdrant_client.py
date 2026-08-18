"""
Qdrant Hybrid Search Client for FutureMe AI Platform.
Provides vector storage, dense retrieval, payload filtering, and sparse/keyword hybrid search re-ranking.
"""

import uuid
from typing import Any, Dict, List, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

from schemas.source_record import SourceRecord


class QdrantHybridClient:
    def __init__(self, location: str = ":memory:"):
        """Initialize Qdrant client in memory or local disk."""
        self.client = QdrantClient(location=location)
        self.default_collection = "future_path_rag"
        self._ensure_collection(self.default_collection, vector_size=1024)

    def _ensure_collection(self, collection_name: str, vector_size: int = 1024):
        """Ensure collection exists in Qdrant with specified vector size (1024 for BAAI/bge-m3)."""
        collections = [c.name for c in self.client.get_collections().collections]
        if collection_name not in collections:
            self.client.create_collection(
                collection_name=collection_name,
                vectors_config=qmodels.VectorParams(
                    size=vector_size,
                    distance=qmodels.Distance.COSINE,
                ),
            )

    def index_documents(
        self,
        records: List[SourceRecord],
        collection_name: Optional[str] = None
    ) -> bool:
        """Index a list of SourceRecord items into Qdrant."""
        col = collection_name or self.default_collection
        self._ensure_collection(col)

        points = []
        for idx, record in enumerate(records):
            point_id = record.source_id or str(uuid.uuid4())
            # Default vector if omitted: 1024-dim zeros
            vector = record.vector if record.vector and len(record.vector) == 1024 else [0.0] * 1024
            
            payload = {
                "source_id": record.source_id,
                "title": record.title,
                "source_type": record.source_type,
                "chunk_content": record.chunk_content,
                "page_number": record.page_number,
                "file_path": record.file_path,
                "metadata": record.metadata,
            }
            if record.metadata:
                for k, v in record.metadata.items():
                    if k not in payload:
                        payload[k] = v

            if isinstance(point_id, int):
                pid = point_id
            elif isinstance(point_id, str) and point_id.isdigit():
                pid = int(point_id)
            else:
                pid = str(uuid.uuid5(uuid.NAMESPACE_DNS, str(point_id)))

            points.append(
                qmodels.PointStruct(
                    id=pid,
                    vector=vector,
                    payload=payload,
                )
            )

        if points:
            self.client.upsert(collection_name=col, points=points)
        return True

    def hybrid_search(
        self,
        query_vector: List[float],
        query_text: str,
        top_k: int = 5,
        filter_criteria: Optional[Dict[str, Any]] = None,
        collection_name: Optional[str] = None
    ) -> List[SourceRecord]:
        """
        Perform hybrid search combining dense vector search and keyword/sparse text scoring.
        """
        col = collection_name or self.default_collection
        
        # Build Qdrant filter condition if provided
        qfilter = None
        if filter_criteria:
            must_conditions = []
            for k, v in filter_criteria.items():
                must_conditions.append(
                    qmodels.FieldCondition(
                        key=k,
                        match=qmodels.MatchValue(value=v)
                    )
                )
            if must_conditions:
                qfilter = qmodels.Filter(must=must_conditions)

        # Dense Vector Search
        try:
            res = self.client.query_points(
                collection_name=col,
                query=query_vector,
                query_filter=qfilter,
                limit=top_k * 2,
            )
            search_results = res.points
        except Exception:
            search_results = self.client.search(
                collection_name=col,
                query_vector=query_vector,
                query_filter=qfilter,
                limit=top_k * 2,
            )

        query_keywords = set(query_text.lower().split())

        scored_records = []
        for hit in search_results:
            payload = hit.payload or {}
            content = (payload.get("chunk_content") or "").lower()
            title = (payload.get("title") or "").lower()

            # Sparse/Keyword scoring match count
            kw_score = 0.0
            if query_keywords:
                matched = sum(1 for kw in query_keywords if kw in content or kw in title)
                kw_score = matched / len(query_keywords)

            # Combined Hybrid Score: 0.7 * Dense Cosine Similarity + 0.3 * Sparse Keyword Score
            dense_score = hit.score if hit.score is not None else 0.0
            hybrid_score = (0.7 * dense_score) + (0.3 * kw_score)

            rec = SourceRecord(
                source_id=str(payload.get("source_id", hit.id)),
                title=payload.get("title", "Untitled Document"),
                source_type=payload.get("source_type", "curriculum"),
                chunk_content=payload.get("chunk_content", ""),
                metadata=payload.get("metadata", {}),
                relevance_score=round(float(hybrid_score), 4),
                page_number=payload.get("page_number"),
                file_path=payload.get("file_path"),
            )
            scored_records.append(rec)

        # Sort by hybrid score descending
        scored_records.sort(key=lambda r: r.relevance_score or 0.0, reverse=True)
        return scored_records[:top_k]


# Alias for backward/alternative class name compatibility
QdrantHybridSearchClient = QdrantHybridClient
