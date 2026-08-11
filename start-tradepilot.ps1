$ErrorActionPreference = "Stop"

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Join-Path $projectDir ".next\standalone"
$serverEntry = Join-Path $serverDir "server.js"
$serverUrl = "http://127.0.0.1:3000/?lang=zh"
$healthUrl = "http://127.0.0.1:3000/api/health"

function Test-TradePilotHealth {
    try {
        $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

if (-not (Test-Path -LiteralPath $serverEntry)) {
    throw "TradePilot AI build is incomplete: $serverEntry was not found."
}

if (-not (Test-TradePilotHealth)) {
    $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeCommand) {
        $node = $nodeCommand.Source
    }
    else {
        $nodeRoots = @(
            (Join-Path $env:USERPROFILE ".workbuddy\binaries\node\versions"),
            (Join-Path $env:ProgramFiles "nodejs")
        )
        $node = $nodeRoots |
            Where-Object { Test-Path -LiteralPath $_ } |
            ForEach-Object {
                Get-ChildItem -LiteralPath $_ -Filter "node.exe" -Recurse -File -ErrorAction SilentlyContinue
            } |
            Sort-Object LastWriteTime -Descending |
            Select-Object -ExpandProperty FullName -First 1
    }
    if (-not $node) {
        throw "Node.js was not found. Install Node.js or restore the bundled runtime."
    }
    $stdout = Join-Path $projectDir "server.stdout.log"
    $stderr = Join-Path $projectDir "server.stderr.log"

    $cmdLine = "/d /c `"`"$node`" `"$serverEntry`" 1>`"$stdout`" 2>`"$stderr`"`""
    Start-Process -FilePath $env:ComSpec `
        -ArgumentList $cmdLine `
        -WorkingDirectory $serverDir `
        -WindowStyle Hidden

    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Milliseconds 500
        if (Test-TradePilotHealth) {
            $ready = $true
            break
        }
    }

    if (-not $ready) {
        Add-Type -AssemblyName PresentationFramework
        [System.Windows.MessageBox]::Show(
            "TradePilot AI failed to start. Check server.stderr.log for details.",
            "TradePilot AI",
            "OK",
            "Error"
        ) | Out-Null
        exit 1
    }
}

$edgeCandidates = @(
    (Join-Path ${env:ProgramFiles(x86)} "Microsoft\Edge\Application\msedge.exe"),
    (Join-Path ${env:ProgramFiles} "Microsoft\Edge\Application\msedge.exe")
)
$edge = $edgeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if ($edge) {
    Start-Process -FilePath $edge -ArgumentList "--app=$serverUrl"
}
else {
    Start-Process $serverUrl
}
