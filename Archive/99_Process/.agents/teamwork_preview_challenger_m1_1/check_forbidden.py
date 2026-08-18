import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

workspace = r"d:\My_server\University\3rd year\Hackathon_ais"
forbidden_strings = [
    "52%",
    "65%",
    "85%",
    "44%",
    "9 ประเภทวิชา",
    "9 สาขาวิชา",
    "file:///d:/"
]

text_extensions = ('.md', '.txt', '.json', '.yaml', '.yml', '.html', '.py', '.sh', '.bat', '.ps1')

data_files = []
root_md_files = []
hackathon_md_files = []
agent_md_files = []

matches_by_file = {}

for root, dirs, files in os.walk(workspace):
    rel_root = os.path.relpath(root, workspace)
    for f in files:
        filepath = os.path.join(root, f)
        rel_path = os.path.relpath(filepath, workspace)
        
        # We process text files
        if filepath.endswith(text_extensions):
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as fp:
                    for line_idx, line in enumerate(fp, 1):
                        for s in forbidden_strings:
                            if s in line:
                                if rel_path not in matches_by_file:
                                    matches_by_file[rel_path] = []
                                matches_by_file[rel_path].append((line_idx, s, line.strip()))
            except Exception as e:
                print(f"Error reading {filepath}: {e}")

print("=== TEXT FILES FORBIDDEN STRING SCAN ===")
print(f"Total text files with matches: {len(matches_by_file)}")

for rel_path, matches in matches_by_file.items():
    print(f"\nFile: {rel_path} ({len(matches)} matches)")
    for line_no, s, content in matches:
        print(f"  Line {line_no} [{s}]: {content[:140]}")

print("\n--- SPECIFIC CATEGORY ANALYSIS ---")

# Check Data/ directory specifically
data_matches = {k: v for k, v in matches_by_file.items() if k.startswith("Data")}
print(f"1. Data/ directory matches: {len(data_matches)}")
if data_matches:
    for k, v in data_matches.items():
        print(f"   - {k}: {len(v)} matches")
else:
    print("   -> CONFIRMED ZERO forbidden strings in all Data/ files (including blueprints, summaries, and flowcharts)!")

# Check blueprints and flowcharts specifically
bp_matches = {k: v for k, v in matches_by_file.items() if "07_System_Blueprints_and_Flowcharts" in k or "blueprints" in k.lower() or "flowcharts" in k.lower()}
print(f"2. Blueprints & Flowcharts matches: {len(bp_matches)}")
if bp_matches:
    for k, v in bp_matches.items():
        print(f"   - {k}: {len(v)} matches")
else:
    print("   -> CONFIRMED ZERO forbidden strings in Blueprints & Flowcharts!")

# Check summaries specifically
summary_matches = {k: v for k, v in matches_by_file.items() if k.endswith("SUMMARY.md")}
print(f"3. Summaries (SUMMARY.md) matches: {len(summary_matches)}")
if summary_matches:
    for k, v in summary_matches.items():
        print(f"   - {k}: {len(v)} matches")
else:
    print("   -> CONFIRMED ZERO forbidden strings in all SUMMARY.md files!")

# Check root markdown files
root_matches = {k: v for k, v in matches_by_file.items() if os.path.dirname(k) == "" and k.endswith(".md")}
print(f"4. Root markdown files matches: {len(root_matches)}")
for k, v in root_matches.items():
    print(f"   - {k}: {len(v)} matches")

