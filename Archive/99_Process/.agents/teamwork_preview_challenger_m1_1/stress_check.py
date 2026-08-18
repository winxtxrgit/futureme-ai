import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

workspace = r"d:\My_server\University\3rd year\Hackathon_ais"

# Extended adversarial variations list
extended_forbidden_patterns = [
    # Original exact strings
    "52%", "65%", "85%", "44%", "9 ประเภทวิชา", "9 สาขาวิชา", "file:///d:/",
    # Space variations
    "52 %", "65 %", "85 %", "44 %", "9ประเภทวิชา", "9สาขาวิชา",
    # Case & Slash variations for absolute file links
    "file:///D:/", "file:///d:\\", "file:///D:\\", "file://d:/", "file://D:/", "file:/d:/", "file:/D:/",
    # Thai numerals variations
    "๕๒%", "๖๕%", "๘๕%", "๔๔%", "๕๒ %", "๖๕ %", "๘๕ %", "๔๔ %", "๙ ประเภทวิชา", "๙ สาขาวิชา", "๙ประเภทวิชา", "๙สาขาวิชา"
]

text_extensions = ('.md', '.txt', '.json', '.yaml', '.yml', '.html', '.py', '.sh', '.bat', '.ps1')

data_dir = os.path.join(workspace, "Data")
matches = []

for root, dirs, files in os.walk(data_dir):
    for f in files:
        if f.endswith(text_extensions):
            filepath = os.path.join(root, f)
            rel_path = os.path.relpath(filepath, workspace)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as fp:
                for line_idx, line in enumerate(fp, 1):
                    for pat in extended_forbidden_patterns:
                        if pat in line:
                            matches.append((rel_path, line_idx, pat, line.strip()))

print("=== ADVERSARIAL STRESS CHECK ON DATA/ REPOSITORY ===")
print(f"Total pattern matches found: {len(matches)}")

if len(matches) > 0:
    for rel_path, line_no, pat, content in matches:
        print(f"  [MATCH] {rel_path}:{line_no} (pattern: '{pat}') -> {content[:140]}")
else:
    print("CONFIRMED: ZERO lingering forbidden strings or adversarial variations found in Data/ directory!")

