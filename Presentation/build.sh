#!/bin/zsh
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
venv_dir="$script_dir/.venv"

if [[ ! -x "$venv_dir/bin/python" ]]; then
  python3 -m venv "$venv_dir"
fi

"$venv_dir/bin/pip" install -r "$script_dir/requirements.txt"
"$venv_dir/bin/python" "$script_dir/generate_presentation.py"

pdf_output_dir="$(mktemp -d /private/tmp/futureme_pdf.XXXXXX)"
lo_profile_dir="$(mktemp -d /private/tmp/futureme_lo.XXXXXX)"

soffice \
  --headless \
  "-env:UserInstallation=file://$lo_profile_dir" \
  --convert-to pdf \
  --outdir "$pdf_output_dir" \
  "$script_dir/FutureMe_Project_Presentation.pptx"

cp \
  "$pdf_output_dir/FutureMe_Project_Presentation.pdf" \
  "$script_dir/FutureMe_Project_Presentation.pdf"

echo "Built:"
echo "  $script_dir/FutureMe_Project_Presentation.pptx"
echo "  $script_dir/FutureMe_Project_Presentation.pdf"
