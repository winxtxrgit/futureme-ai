import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

workspace = r"d:\My_server\University\3rd year\Hackathon_ais"

files_to_inspect = [
    "Data/01_Graduate_Unemployment_and_Mismatch_Stats/01_Thai_Statistics.md",
    "Data/01_Graduate_Unemployment_and_Mismatch_Stats/02_Global_Statistics.md",
    "Data/01_Graduate_Unemployment_and_Mismatch_Stats/SUMMARY.md",
    "Data/02_Thai_National_Curricula/02_Vocational_Education_Curriculum.md",
    "Data/07_System_Blueprints_and_Flowcharts/detailed_system_flowcharts.md",
    "Data/07_System_Blueprints_and_Flowcharts/implementation_plan.md"
]

print("=== REFACTORED CONTENT INSPECTION ===")

for rel_path in files_to_inspect:
    full_path = os.path.join(workspace, rel_path)
    print(f"\n--- File: {rel_path} ---")
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            # print keywords lines
            for i, line in enumerate(lines, 1):
                if any(kw in line for kw in ["TDRI", "39%", "56%", "304,378", "ทวิภาคี", "relative", "http", "Data/"]):
                    print(f"  Line {i}: {line.strip()[:140]}")
    else:
        print("  File not found!")

