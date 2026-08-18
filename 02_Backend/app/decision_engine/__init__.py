"""
Multi-Tier Decision Engine Package (R2 Decision Engine).

Exposes:
- RIASEC: assessment parser & scorer (`riasec.py`)
- STAR Eval: qualitative Socratic/STAR evaluator (`star_eval.py`)
- Multi-Tier: 4-tier education router (`multi_tier.py`)
- Matrix: 5-weighted recommendation decision matrix calculator (`matrix.py`)
- Route Generator: 3 route alternatives generator (`route_generator.py`)
"""

from app.decision_engine.riasec import (
    RIASECItem,
    RIASECResponse,
    RIASECScoreResult,
    RIASECScorer,
    get_default_riasec_items,
    parse_riasec_responses,
    score_riasec,
    DEFAULT_RIASEC_ITEMS,
)

from app.decision_engine.star_eval import (
    STARQuestion,
    STARResponse,
    STAREvaluationResult,
    STAREvaluator,
    select_adaptive_star_questions,
    evaluate_star_responses,
    QUESTION_BANK,
)

from app.decision_engine.multi_tier import (
    EducationTier,
    CandidatePathway,
    TierRoutingResult,
    MultiTierRouter,
    detect_tier,
    route_tier_pathways,
    VOCATIONAL_AREAS_2567,
    TPAT_MAPPINGS,
    M4_LEARNING_TRACKS,
)

from app.decision_engine.matrix import (
    FeasibilityContext,
    FlexibilityContext,
    MatrixScoreBreakdown,
    DecisionMatrixCalculator,
    calculate_decision_matrix,
    WEIGHT_INTERESTS,
    WEIGHT_STRENGTHS,
    WEIGHT_LEARNING_STYLE,
    WEIGHT_FEASIBILITY,
    WEIGHT_FUTURE_FLEXIBILITY,
)

from app.decision_engine.route_generator import (
    RouteAlternative,
    DecisionEngineResponse,
    RouteGenerator,
    generate_routes,
    run_decision_engine,
)

__all__ = [
    # RIASEC
    "RIASECItem",
    "RIASECResponse",
    "RIASECScoreResult",
    "RIASECScorer",
    "get_default_riasec_items",
    "parse_riasec_responses",
    "score_riasec",
    "DEFAULT_RIASEC_ITEMS",
    # STAR
    "STARQuestion",
    "STARResponse",
    "STAREvaluationResult",
    "STAREvaluator",
    "select_adaptive_star_questions",
    "evaluate_star_responses",
    "QUESTION_BANK",
    # Multi-Tier
    "EducationTier",
    "CandidatePathway",
    "TierRoutingResult",
    "MultiTierRouter",
    "detect_tier",
    "route_tier_pathways",
    "VOCATIONAL_AREAS_2567",
    "TPAT_MAPPINGS",
    "M4_LEARNING_TRACKS",
    # Matrix
    "FeasibilityContext",
    "FlexibilityContext",
    "MatrixScoreBreakdown",
    "DecisionMatrixCalculator",
    "calculate_decision_matrix",
    "WEIGHT_INTERESTS",
    "WEIGHT_STRENGTHS",
    "WEIGHT_LEARNING_STYLE",
    "WEIGHT_FEASIBILITY",
    "WEIGHT_FUTURE_FLEXIBILITY",
    # Route Generator
    "RouteAlternative",
    "DecisionEngineResponse",
    "RouteGenerator",
    "generate_routes",
    "run_decision_engine",
]
