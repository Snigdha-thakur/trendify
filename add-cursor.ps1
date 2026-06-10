$files = Get-ChildItem -Path "frontend" -Include *.html -Recurse | Where-Object { $_.FullName -notmatch "\\dist\\" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip if already has cursor
    if ($content -match 'id="c"') {
        Write-Host "Skipping $($file.Name) - already has cursor"
        continue
    }
    
    # Add cursor divs before </body>
    $cursorHtml = @"
<div id="c"></div>
<div id="cr" class="cr"></div>

"@
    $content = $content -replace '</body>', "$cursorHtml</body>"
    
    # Add cursor.js script if not present and if it's admin/creator page
    if ($file.DirectoryName -match "(admin|creator)" -and $content -notmatch "cursor\.js") {
        $scriptTag = '<script src="../js/cursor.js"></script>'
        $content = $content -replace '</body>', "$scriptTag`n</body>"
    }
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Updated $($file.Name)"
}

Write-Host "`nDone! Updated cursor in all HTML files."
