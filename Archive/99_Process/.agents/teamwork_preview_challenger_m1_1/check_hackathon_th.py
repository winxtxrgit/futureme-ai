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

hackathon_th_dir = os.path.join(workspace, "hackathon_th")
matches = []

for root, dirs, files in os.walk(hackathon_th_dir):
    for f in files:
        if f.endswith(('.md', '.txt', '.json', '.yaml', '.py')):
            filepath = os.path.join(root, f)
            rel_path = os.path.relpath(filepath, workspace)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as fp:
                for line_idx, line in enumerate(fp, 1):
                    for s in forbidden_strings:
                        if s in line:
                            matches.append((rel_path, line_idx, s, line.strip()))

print(f"hackathon_th text files check: {len(matches)} matches found.")
for rel, line_no, s, content in matches:
    print(f"  {rel}:{line_no} [{s}] -> {content}")

