$mdFiles = Get-ChildItem -Path "d:/My_server/University/3rd year/Hackathon_ais/Data", "d:/My_server/University/3rd year/Hackathon_ais" -Filter *.md -Recurse | Where-Object { $_.FullName -notmatch '\\.agents\\' }
$broken = 0
foreach ($f in $mdFiles) {
    $content = Get-Content -Path $f.FullName -Raw
    $matches = [regex]::Matches($content, '\[.*?\]\((?!http)(.*?)\)')
    foreach ($m in $matches) {
        $link = $m.Groups[1].Value.Split(' ')[0].Split('#')[0]
        if ($link -ne '') {
            $tp = Join-Path -Path $f.DirectoryName -ChildPath $link
            if (-not (Test-Path $tp)) {
                Write-Host ("Broken link in " + $f.FullName + " -> " + $link)
                $broken++
            }
        }
    }
}
Write-Host ("Total broken relative links found: " + $broken)
