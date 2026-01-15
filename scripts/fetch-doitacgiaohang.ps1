param(
    [string]$OutputPath = "doitacgiaohang.csv"
)

$sheetId = "1jjzb4CUl_9iJ9Hlgov7tqqifrRJPojTGkCItJ22PSTk"
$gid = "0"
$url = "https://docs.google.com/spreadsheets/d/$sheetId/export?format=csv&gid=$gid"

Invoke-WebRequest -Uri $url -OutFile $OutputPath
Write-Host "Saved partner data to $OutputPath"
