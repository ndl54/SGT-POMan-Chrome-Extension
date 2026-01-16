param(
    [string]$PartnerOutputPath = "doitacgiaohang.csv",
    [string]$SupplierOutputPath = "nhacungcap.csv"
)

$sheetId = "1jjzb4CUl_9iJ9Hlgov7tqqifrRJPojTGkCItJ22PSTk"
$partnerSheet = "Doi_Tac_Giao_Hang"
$supplierSheet = "Nha_Cung_Cap"
$partnerUrl = "https://docs.google.com/spreadsheets/d/$sheetId/export?format=csv&sheet=$partnerSheet"
$supplierUrl = "https://docs.google.com/spreadsheets/d/$sheetId/export?format=csv&sheet=$supplierSheet"

Invoke-WebRequest -Uri $partnerUrl -OutFile $PartnerOutputPath
Write-Host "Saved partner data to $PartnerOutputPath"

Invoke-WebRequest -Uri $supplierUrl -OutFile $SupplierOutputPath
Write-Host "Saved supplier data to $SupplierOutputPath"
