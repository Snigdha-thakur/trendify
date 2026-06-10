$pages = @('admin.js','overview.js','payments.js','user-management.js','kyc-management.js',
           'wallet-balance.js','payout-history.js','wallet-logs.js','webhook-logs.js',
           'payout-webhooks.js','gateway-logs.js','referral-history.js','referral-payouts.js',
           'creator-payouts.js','digital-products.js')

Get-ChildItem "*.html" | ForEach-Object {
    $f = $_.FullName
    $c = Get-Content $f -Raw
    if ($c -match 'admin-api\.js') { Write-Host "Skip: $($_.Name)"; return }
    foreach ($p in $pages) {
        $tag = '<script src="' + $p + '"></script>'
        if ($c -match [regex]::Escape($tag)) {
            $inject = '<script src="../js/auth-api.js"></script>' + "`n" + '<script src="admin-api.js"></script>' + "`n" + $tag
            $c = $c -replace [regex]::Escape($tag), $inject
        }
    }
    Set-Content $f $c -NoNewline
    Write-Host "Done: $($_.Name)"
}
