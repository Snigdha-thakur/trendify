Get-ChildItem -Path .\admin\*.html | ForEach-Object {
    $path = $_.FullName
    $text = Get-Content -Raw -Encoding UTF8 $path
    $new = $text -replace '<span class="sb-label">PLATFORM<\/span>','<span class="sb-label">platform<\/span>' -replace '<span class="sb-label">Platform<\/span>','<span class="sb-label">platform<\/span>'
    if ($new -ne $text) {
        Set-Content -Path $path -Value $new -Encoding UTF8
        Write-Host "Updated: $path"
    }
}
