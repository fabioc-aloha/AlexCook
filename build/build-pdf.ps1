# Build script for The Alex Cookbook PDF
# Usage: .\build\build-pdf.ps1
# Always generates both PRINT and DIGITAL versions

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host ""
Write-Host "🍳 The Alex Cookbook - PDF Builder" -ForegroundColor Cyan
Write-Host "   Building: PRINT + DIGITAL versions" -ForegroundColor White
Write-Host ""

# Output paths
$OutputDir = Join-Path $ProjectRoot "book\output"
$CombinedMd = Join-Path $OutputDir "cookbook-combined.md"

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Define chapter order from book/ folder
# Front matter uses 00x prefix, chapters align with banner numbers (01-15)
$Chapters = @(
    "book\00-cover.md"
    "book\00a-dedication.md"
    "book\00b-introduction.md"
    "book\00c-meet-alex.md"
    "book\00d-behind-the-scenes.md"
    "book\00e-readers-guide.md"
    "book\01-appetizers.md"
    "book\02-soups-salads.md"
    "book\03-main-courses.md"
    "book\04-sides.md"
    "book\05-desserts.md"
    "book\06-breakfast.md"
    "book\07-drinks.md"
    "book\08-sauces.md"
    "book\09-bread-baking.md"
    "book\10-special-occasions.md"
    "book\11-dog-treats.md"
    "book\12-steaks.md"
    "book\13-comfort-classics.md"
    "book\14-alex-favorites.md"
    "book\15-unhinged-kitchen.md"
    "book\16-appendix-a-aphrodisiac.md"
    "book\17-appendix-b-risotto-rice.md"
    "book\18-cooking-conversions.md"
    "book\19-kitchen-essentials.md"
    "book\20-amazon-shopping-list.md"
    "book\21-references.md"
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

% Front matter uses Roman numerals (i, ii, iii...)
\pagenumbering{roman}

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
        
        # === PDF CONVERSION (SVG → PNG, HTML → Markdown) ===
        
        $PngPath = "$ProjectRoot/book/assets/banners/png"
        
        # For chapters with banners: move banner AFTER the heading to prevent page break separation
        # Pattern: <img banner> followed by # Chapter Heading
        # Result: # Chapter Heading followed by banner image (only for H1, not ## or ###)
        if ($Content -match '<img[^>]*src="[^"]*banners/(\d{2}-[^"]+)\.svg"[^>]*>') {
            $bannerName = $matches[1]
            # Remove the banner from its original position
            $Content = $Content -replace '<img[^>]*src="[^"]*banners/[^"]+\.svg"[^>]*>\r?\n*', ''
            # Insert banner after the H1 chapter heading line ONLY (^# not ##)
            $Content = $Content -replace '(?m)(^# [^\r\n]+)', "`$1`n`n![]($PngPath/$bannerName.png){width=100%}"
        }
        
        # Convert any remaining SVG references to PNG
        $Content = $Content -replace '!\[([^\]]*)\]\(\./assets/banners/([^)]+)\.svg\)', "![]($PngPath/`$2.png){width=100%}"
        $Content = $Content -replace '!\[([^\]]*)\]\(\./cover\.svg\)', "![]($PngPath/cover.png){width=100%}"
        
        # Clean up remaining HTML tags
        $Content = $Content -replace '<img[^>]*>', ''
        $Content = $Content -replace '<div[^>]*>', ''
        $Content = $Content -replace '</div>', ''
        
        # Strip internal anchor links (not useful in PDF, cause hyperref warnings)
        $Content = $Content -replace '\[([^\]]+)\]\(#[^)]+\)', '$1'
        
        # === CHAPTER FORMATTING ===
        
        # For recipe chapters, merge tagline into heading for cleaner TOC
        if ($Chapter -match 'book\\\d{2}-(appetizers|soups|main|sides|desserts|breakfast|drinks|sauces|bread|special|dog|steaks|comfort|alex|unhinged|appendix)') {
            $Content = $Content -replace '(# [^\r\n]+)\r?\n\r?\n### \*"([^"]+)"\*', '$1 — *"$2"*'
            $Content = $Content -replace '(# [^\r\n]*?)Chapter \d+:\s*', '$1'
        }
        
        # === FRONT MATTER HANDLING ===
        # Make dedication and introduction unnumbered (use {.unnumbered} attribute)
        if ($Chapter -match 'book\\00[ab]-(dedication|introduction)\.md') {
            # Convert # Heading to # Heading {.unnumbered} for Pandoc
            $Content = $Content -replace '^(# [^\r\n{]+)(\r?\n)', '$1 {.unnumbered}$2'
        }
        
        # === EMOJI HANDLING ===
        
        # Strip variation selectors (U+FE0F) - Twemoji uses base codepoints
        $Content = $Content -replace '\uFE0F', ''
        
        # Replace emojis with inline images
        # IMPORTANT: Sort by length descending so compound emojis (ZWJ sequences like 🧑‍🍳)
        # are matched BEFORE their component parts (🧑, 🍳)
        $sortedEmojis = $EmojiMap.Keys | Sort-Object { $_.Length } -Descending
        foreach ($emoji in $sortedEmojis) {
            # Use forward slashes consistently for LaTeX compatibility
            $imgPath = ($ProjectRoot + "/" + $EmojiMap[$emoji]) -replace '\\', '/'
            # Use LaTeX includegraphics for inline emoji (height matches text)
            $replacement = "![emoji]($imgPath){height=1em}"
            $Content = $Content.Replace($emoji, $replacement)
        }
        
        # Switch to Arabic numerals and reset chapter counter at first real chapter
        if ($Chapter -eq "book\01-appetizers.md") {
            $CombinedContent += '```{=latex}' + "`n\pagenumbering{arabic}`n\setcounter{chapter}{0}`n" + '```' + "`n`n"
        }
        
        # Add chapter content (book class automatically handles page breaks before chapters)
        $CombinedContent += $Content + "`n`n"
    }
    else {
        Write-Host "  $progress ✗ $Chapter (NOT FOUND)" -ForegroundColor Red
    }
}

# Write combined markdown
$CombinedContent | Out-File -FilePath $CombinedMd -Encoding UTF8
$mdSize = (Get-Item $CombinedMd).Length
Write-Host "📝 Combined markdown: $CombinedMd ($([math]::Round($mdSize/1KB, 1)) KB)" -ForegroundColor Yellow

# Function to build PDF with specified config
function Build-CookbookPdf {
    param(
        [string]$ConfigFile,
        [string]$OutputPdf,
        [string]$Label
    )
    
    Write-Host ""
    Write-Host "🔨 Building $Label..." -ForegroundColor Yellow
    Write-Host "   Config: $ConfigFile" -ForegroundColor DarkGray
    
    # Capture PDF timestamp before build (if exists)
    $oldPdfSize = 0
    if (Test-Path $OutputPdf) {
        $oldPdfSize = (Get-Item $OutputPdf).Length
    }
    
    $startTime = Get-Date
    
    try {
        $pandocOutput = pandoc $CombinedMd `
            --metadata-file=$ConfigFile `
            --pdf-engine=lualatex `
            --resource-path="$ProjectRoot;$ProjectRoot\book;$ProjectRoot\book\assets" `
            -V "hyperrefoptions=draft" `
            -o $OutputPdf 2>&1
        
        $exitCode = $LASTEXITCODE
        $elapsed = (Get-Date) - $startTime
        
        # Show any warnings from Pandoc
        if ($pandocOutput) {
            $pandocOutput | ForEach-Object {
                if ($_ -match "WARNING") {
                    Write-Host "   $_" -ForegroundColor DarkYellow
                }
                elseif ($_ -match "ERROR|error") {
                    Write-Host "   $_" -ForegroundColor Red
                }
            }
        }
        
        # Verify PDF was created
        if (-not (Test-Path $OutputPdf)) {
            Write-Host "   ❌ FAILED: PDF file was not created!" -ForegroundColor Red
            return $false
        }
        
        $newPdfSize = (Get-Item $OutputPdf).Length
        
        Write-Host "   ✅ Created in $([math]::Round($elapsed.TotalSeconds, 1))s" -ForegroundColor Green
        Write-Host "   📄 $OutputPdf" -ForegroundColor White
        Write-Host "   📊 Size: $([math]::Round($newPdfSize/1MB, 2)) MB" -ForegroundColor White
        if ($oldPdfSize -gt 0) {
            $sizeDiff = $newPdfSize - $oldPdfSize
            $diffSign = if ($sizeDiff -ge 0) { "+" } else { "" }
            Write-Host "   📈 Size change: $diffSign$([math]::Round($sizeDiff/1KB, 1)) KB" -ForegroundColor DarkGray
        }
        return $true
    }
    catch {
        Write-Host "   ❌ Pandoc failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Build both versions
$success = $true

$PrintConfig = Join-Path $ProjectRoot "build\cookbook.yaml"
$PrintPdf = Join-Path $OutputDir "The-Alex-Cookbook-Print.pdf"
if (-not (Build-CookbookPdf -ConfigFile $PrintConfig -OutputPdf $PrintPdf -Label "PRINT version (twoside, chapters start on right pages)")) {
    $success = $false
}

$DigitalConfig = Join-Path $ProjectRoot "build\cookbook-digital.yaml"
$DigitalPdf = Join-Path $OutputDir "The-Alex-Cookbook-Digital.pdf"
if (-not (Build-CookbookPdf -ConfigFile $DigitalConfig -OutputPdf $DigitalPdf -Label "DIGITAL version (oneside, no blank pages)")) {
    $success = $false
}

Write-Host ""
if ($success) {
    Write-Host "🎉 All builds completed successfully!" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Some builds failed. Check output above." -ForegroundColor Yellow
    exit 1
}
Write-Host ""
