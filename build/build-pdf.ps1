# Build script for The Alex Cookbook PDF
# Usage: .\build\build-pdf.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "🍳 Building The Alex Cookbook PDF..." -ForegroundColor Cyan

# Output paths
$OutputDir = Join-Path $ProjectRoot "book\output"
$CombinedMd = Join-Path $OutputDir "cookbook-combined.md"
$OutputPdf = Join-Path $OutputDir "The-Alex-Cookbook.pdf"

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Define chapter order from book/ folder
$Chapters = @(
    "book\00-cover.md"
    "book\01-dedication.md"
    "book\02-introduction.md"
    "book\03-table-of-contents.md"
    "book\04-appetizers.md"
    "book\05-soups-salads.md"
    "book\06-main-courses.md"
    "book\07-sides.md"
    "book\08-desserts.md"
    "book\09-breakfast.md"
    "book\10-drinks.md"
    "book\11-sauces.md"
    "book\12-bread-baking.md"
    "book\13-special-occasions.md"
    "book\14-dog-treats.md"
    "book\15-steaks.md"
    "book\16-comfort-classics.md"
    "book\17-alex-favorites.md"
    "book\18-unhinged-kitchen.md"
    "book\19-appendix-a-aphrodisiac.md"
    "book\20-appendix-b-risotto-rice.md"
    "book\21-cooking-conversions.md"
    "book\22-kitchen-essentials.md"
)

Write-Host "📚 Combining chapters..." -ForegroundColor Yellow

# Combine all markdown files
$CombinedContent = @()

# Add cover image as first page using raw LaTeX block for Pandoc
$CoverPng = "$ProjectRoot/book/assets/banners/png/cover.png" -replace '\\', '/'
$CoverContent = '```{=latex}
\thispagestyle{empty}
\newgeometry{margin=0pt}
\begin{tikzpicture}[remember picture,overlay]
  \node[inner sep=0pt] at (current page.center) {
    \includegraphics[width=\paperwidth,height=\paperheight,keepaspectratio=false]{' + $CoverPng + '}
  };
\end{tikzpicture}
\restoregeometry
\newpage

\setcounter{tocdepth}{0}
\tableofcontents
\newpage
```'

$CombinedContent += $CoverContent
$CombinedContent += "`n`n"

# Load emoji map for replacement
$EmojiMapPath = Join-Path $ProjectRoot "build\emoji-map.json"
$EmojiMap = @{}
if (Test-Path $EmojiMapPath) {
    $EmojiMap = Get-Content $EmojiMapPath -Raw | ConvertFrom-Json -AsHashtable
    Write-Host "📦 Loaded $($EmojiMap.Count) emoji mappings" -ForegroundColor Yellow
}
else {
    Write-Host "⚠️  No emoji map found at $EmojiMapPath" -ForegroundColor Yellow
}

$chapterCount = 0
$totalChapters = $Chapters.Count
foreach ($Chapter in $Chapters) {
    $chapterCount++
    $progress = "[$chapterCount/$totalChapters]"
    
    # Skip the cover since we're using a custom LaTeX cover
    if ($Chapter -eq "book\00-cover.md") {
        Write-Host "  $progress ✓ $Chapter (using custom cover)" -ForegroundColor Green
        continue
    }
    
    $FilePath = Join-Path $ProjectRoot $Chapter
    if (Test-Path $FilePath) {
        Write-Host "  $progress ✓ $Chapter" -ForegroundColor Green
        
        $Content = Get-Content $FilePath -Raw -Encoding UTF8
        
        # Skip TOC file - we use LaTeX-generated TOC instead
        if ($Chapter -eq "book\03-table-of-contents.md") {
            Write-Host "  $progress ✓ $Chapter (using LaTeX TOC)" -ForegroundColor Green
            continue
        }
        
        # === PDF CONVERSION (SVG → PNG, HTML → Markdown) ===
        
        # Convert SVG image references to PNG (Pandoc/LaTeX doesn't handle SVG well)
        $PngPath = "$ProjectRoot/book/assets/banners/png"
        $Content = $Content -replace '!\[([^\]]*)\]\(\./assets/banners/([^)]+)\.svg\)', "![]($PngPath/`$2.png){width=100%}"
        $Content = $Content -replace '!\[([^\]]*)\]\(\./cover\.svg\)', "![]($PngPath/cover.png){width=100%}"
        
        # Convert HTML <img> tags to Markdown (LaTeX compatibility)
        $Content = $Content -replace '<img[^>]*src="[^"]*banners/([^"]+)\.svg"[^>]*>', "![]($PngPath/`$1.png){width=100%}"
        $Content = $Content -replace '<img[^>]*>', ''
        $Content = $Content -replace '<div[^>]*>', ''
        $Content = $Content -replace '</div>', ''
        
        # === CHAPTER FORMATTING ===
        
        # For recipe chapters, merge tagline into heading for cleaner TOC
        if ($Chapter -match 'book\\\d{2}-(appetizers|soups|main|sides|desserts|breakfast|drinks|sauces|bread|special|dog|steaks|comfort|alex|unhinged|appendix)') {
            $Content = $Content -replace '(# [^\r\n]+)\r?\n\r?\n### \*"([^"]+)"\*', '$1 — *"$2"*'
            $Content = $Content -replace '(# [^\r\n]*?)Chapter \d+:\s*', '$1'
        }
        
        # === EMOJI HANDLING ===
        
        # Strip variation selectors (U+FE0F) - Twemoji uses base codepoints
        $Content = $Content -replace '\uFE0F', ''
        
        # Replace emojis with inline images
        foreach ($emoji in $EmojiMap.Keys) {
            # Use forward slashes consistently for LaTeX compatibility
            $imgPath = ($ProjectRoot + "/" + $EmojiMap[$emoji]) -replace '\\', '/'
            # Use LaTeX includegraphics for inline emoji (height matches text)
            $replacement = "![emoji]($imgPath){height=1em}"
            $Content = $Content.Replace($emoji, $replacement)
        }
        
        # Add page break between chapters using raw LaTeX block
        $CombinedContent += $Content
        $CombinedContent += "`n`n" + '```{=latex}' + "`n\newpage`n" + '```' + "`n`n"
    }
    else {
        Write-Host "  $progress ✗ $Chapter (NOT FOUND)" -ForegroundColor Red
    }
}

# Write combined markdown
$CombinedContent | Out-File -FilePath $CombinedMd -Encoding UTF8
$mdSize = (Get-Item $CombinedMd).Length
Write-Host "📝 Combined markdown: $CombinedMd ($([math]::Round($mdSize/1KB, 1)) KB)" -ForegroundColor Yellow

# Build PDF with Pandoc
Write-Host "🔨 Running Pandoc..." -ForegroundColor Yellow
Write-Host "   This may take 30-60 seconds..." -ForegroundColor DarkGray

$MetadataFile = Join-Path $ProjectRoot "build\cookbook.yaml"

# Capture PDF timestamp before build (if exists)
$oldPdfTime = $null
$oldPdfSize = 0
if (Test-Path $OutputPdf) {
    $oldPdfTime = (Get-Item $OutputPdf).LastWriteTime
    $oldPdfSize = (Get-Item $OutputPdf).Length
}

$startTime = Get-Date

try {
    $pandocOutput = pandoc $CombinedMd `
        --metadata-file=$MetadataFile `
        --pdf-engine=lualatex `
        --resource-path="$ProjectRoot;$ProjectRoot\book;$ProjectRoot\book\assets" `
        -o $OutputPdf 2>&1
    
    $exitCode = $LASTEXITCODE
    $elapsed = (Get-Date) - $startTime
    
    # Show any warnings from Pandoc
    if ($pandocOutput) {
        $pandocOutput | ForEach-Object {
            if ($_ -match "WARNING") {
                Write-Host $_ -ForegroundColor DarkYellow
            }
            elseif ($_ -match "ERROR|error") {
                Write-Host $_ -ForegroundColor Red
            }
        }
    }
    
    # Verify PDF was created/updated
    if (-not (Test-Path $OutputPdf)) {
        Write-Host ""
        Write-Host "❌ FAILED: PDF file was not created!" -ForegroundColor Red
        Write-Host "   Pandoc exit code: $exitCode" -ForegroundColor Red
        exit 1
    }
    
    $newPdfTime = (Get-Item $OutputPdf).LastWriteTime
    $newPdfSize = (Get-Item $OutputPdf).Length
    
    # Check if file was actually updated
    if ($oldPdfTime -and $newPdfTime -le $oldPdfTime) {
        Write-Host ""
        Write-Host "⚠️  WARNING: PDF file was NOT updated!" -ForegroundColor Yellow
        Write-Host "   Old timestamp: $oldPdfTime" -ForegroundColor Yellow
        Write-Host "   New timestamp: $newPdfTime" -ForegroundColor Yellow
        Write-Host "   Pandoc may have failed silently." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ SUCCESS! PDF created in $([math]::Round($elapsed.TotalSeconds, 1))s" -ForegroundColor Green
    Write-Host "   📄 $OutputPdf" -ForegroundColor White
    Write-Host "   📊 Size: $([math]::Round($newPdfSize/1MB, 2)) MB" -ForegroundColor White
    Write-Host "   🕐 Timestamp: $newPdfTime" -ForegroundColor White
    if ($oldPdfSize -gt 0) {
        $sizeDiff = $newPdfSize - $oldPdfSize
        $diffSign = if ($sizeDiff -ge 0) { "+" } else { "" }
        Write-Host "   📈 Size change: $diffSign$([math]::Round($sizeDiff/1KB, 1)) KB" -ForegroundColor DarkGray
    }
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "❌ Pandoc failed with exception:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}
