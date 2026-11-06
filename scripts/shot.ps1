param(
  [string[]]$Paths = @("/"),
  [string]$BaseUrl = "https://raiksan.github.io/Sercomp-Website-Debug",
  [string]$OutDir = "$env:TEMP\sercomp-shots",
  [int]$Width = 1400,
  [int]$Height = 900
)

$ff = "C:\Program Files\Mozilla Firefox\firefox.exe"
$env:MOZ_HEADLESS = "1"
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

$i = 0
foreach ($p in $Paths) {
  $i++
  $safe = ($p -replace '[\\/:*?"<>|]', '_')
  if ([string]::IsNullOrWhiteSpace($safe)) { $safe = "root" }
  $out = Join-Path $OutDir ("{0:d2}_{1}.png" -f $i, $safe)
  $prof = Join-Path $env:TEMP ("ffprof_shot_{0}" -f $i)
  if (Test-Path $prof) { Remove-Item $prof -Recurse -Force }
  New-Item -ItemType Directory $prof | Out-Null
  if (Test-Path $out) { Remove-Item $out -Force }

  $url = "$BaseUrl$p"
  $proc = Start-Process -FilePath $ff -ArgumentList @(
    "--headless", "--no-remote", "--profile", $prof,
    "--window-size=$Width,$Height", "--screenshot", $out, $url
  ) -PassThru -NoNewWindow
  $proc | Wait-Process -Timeout 45 -ErrorAction SilentlyContinue
  if (-not $proc.HasExited) { try { $proc.Kill() } catch {} }

  $size = if (Test-Path $out) { (Get-Item $out).Length } else { 0 }
  "{0,-45} {1,8} bytes  {2}" -f $p, $size, $out
  Remove-Item $prof -Recurse -Force -ErrorAction SilentlyContinue
}
