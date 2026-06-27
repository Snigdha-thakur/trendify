$files = Get-ChildItem 'C:\Users\snigd\OneDrive\Documents\trendify\frontend\admin\*.html'
foreach ($f in $files) {
    $c = Get-Content $f.FullName -Raw
    # Fix chevron: replace inline style with class
    $c = $c -replace 'style="margin-left:auto;opacity:\.5;flex-shrink:0"', 'class="sb-chevron"'
    # Fix broken class=sb-chevron (no quotes)
    $c = $c -replace 'class=sb-chevron([^"])', 'class="sb-chevron"$1'
    # Bump version
    $c = $c -replace 'admin\.css\?v=\d+', 'admin.css?v=8'
    $c = $c -replace 'sidebar-init\.js\?v=\d+', 'sidebar-init.js?v=8'
    Set-Content $f.FullName $c -NoNewline
}
Write-Host "Done"
