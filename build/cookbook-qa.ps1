#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automated QA analysis for The Alex Cookbook PDF

.DESCRIPTION
    Extracts text from the generated PDF and performs comprehensive quality checks:
    - Document statistics (word count, page estimate)
    - Character emoji consistency
    - Family member mentions
    - Difficulty terminology consistency
    - IBS terminology consistency
    - Typo detection (doubled words, common misspellings)
    - Pronoun consistency for characters

.PARAMETER PdfPath
    Path to the PDF file to analyze. Defaults to the Print version.

.PARAMETER OutputReport
    If specified, saves the report to this file path.

.EXAMPLE
    .\cookbook-qa.ps1
    .\cookbook-qa.ps1 -PdfPath ".\output\The-Alex-Cookbook-Digital.pdf"
    .\cookbook-qa.ps1 -OutputReport ".\output\qa-report.txt"
#>

param(
    [string]$PdfPath = ".\book\output\The-Alex-Cookbook-Print.pdf",
    [string]$OutputReport = ""
)

$ErrorActionPreference = "Stop"

# ============================================
# CONFIGURATION - Character Emoji Definitions
# ============================================
$CharacterEmojis = @{
    "Alex"    = "🧑‍🍳"      # Chef emoji
    "Claudia" = "👩‍🦰"   # Woman with red hair
    "Douglas" = "🧒"     # Child
    "Freddy"  = "🐕"      # Dog (generic)
    "Jolly"   = "🐩"       # Poodle (she's a poodle!)
}

$CharacterPronouns = @{
    "Alex"    = @("he", "him", "his")      # AI, uses he/him
    "Claudia" = @("she", "her", "hers") # Female
    "Douglas" = @("he", "him", "his")   # Male
    "Freddy"  = @("he", "him", "his")    # Male dog
    "Jolly"   = @("she", "her", "hers")   # Female dog
}

# ============================================
# FUNCTIONS
# ============================================

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host ("=" * 50) -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor White
    Write-Host ("=" * 50) -ForegroundColor Cyan
}

function Write-Check {
    param([string]$Name, [string]$Value, [string]$Status = "info")
    $icon = switch ($Status) {
        "pass" { "✅" }
        "fail" { "❌" }
        "warn" { "⚠️" }
        default { "📊" }
    }
    Write-Host "  $icon $Name`: $Value"
}

function Extract-PdfText {
    param([string]$PdfPath, [string]$OutputPath)
    
    Write-Host "📄 Extracting text from PDF..." -ForegroundColor Yellow
    
    # Try pdftotext (from poppler or MiKTeX)
    $pdftotext = Get-Command pdftotext -ErrorAction SilentlyContinue
    
    if ($pdftotext) {
        & pdftotext -layout $PdfPath $OutputPath 2>$null
        if ($LASTEXITCODE -eq 0 -and (Test-Path $OutputPath)) {
            $size = (Get-Item $OutputPath).Length
            Write-Host "  ✅ Extracted $([math]::Round($size/1024, 1)) KB of text" -ForegroundColor Green
            return $true
        }
    }
    
    Write-Host "  ❌ pdftotext not found. Install poppler-utils or use MiKTeX." -ForegroundColor Red
    return $false
}

function Analyze-DocumentStats {
    param([string]$Content)
    
    Write-Section "DOCUMENT STATISTICS"
    
    $lines = ($Content -split "`n").Count
    $chars = $Content.Length
    $words = ($Content -split '\s+').Count
    $pages = [math]::Round($words / 250)  # Rough estimate
    
    Write-Check "Total Lines" $lines.ToString("N0")
    Write-Check "Total Characters" $chars.ToString("N0")
    Write-Check "Total Words" $words.ToString("N0")
    Write-Check "Estimated Pages" "~$pages"
    
    return @{
        Lines          = $lines
        Characters     = $chars
        Words          = $words
        EstimatedPages = $pages
    }
}

function Analyze-FamilyMentions {
    param([string]$Content)
    
    Write-Section "FAMILY MEMBER MENTIONS"
    
    $results = @{}
    foreach ($name in @("Claudia", "Douglas", "Freddy", "Jolly", "Fabio", "Watson")) {
        $count = ([regex]::Matches($Content, "\b$name\b")).Count
        $results[$name] = $count
        Write-Check $name "$count mentions"
    }
    
    return $results
}

function Analyze-DifficultyTerms {
    param([string]$Content)
    
    Write-Section "DIFFICULTY TERMINOLOGY"
    
    Write-Host "  📖 Reader's Guide defines: Simple | Medium | Complex" -ForegroundColor Gray
    Write-Host ""
    
    $terms = @{
        "Simple"  = ([regex]::Matches($Content, '\bSimple\b')).Count
        "Easy"    = ([regex]::Matches($Content, '\bEasy\b')).Count
        "Medium"  = ([regex]::Matches($Content, '\bMedium\b')).Count
        "Complex" = ([regex]::Matches($Content, '\bComplex\b')).Count
        "Hard"    = ([regex]::Matches($Content, '\bHard\b')).Count
    }
    
    # Check recipe difficulty lines specifically
    $diffEasy = ([regex]::Matches($Content, 'Difficulty:.+Easy')).Count
    $diffSimple = ([regex]::Matches($Content, 'Difficulty:.+Simple')).Count
    $diffHard = ([regex]::Matches($Content, 'Difficulty:.+Hard')).Count
    $diffComplex = ([regex]::Matches($Content, 'Difficulty:.+Complex')).Count
    
    Write-Check "Easy (in recipes)" $diffEasy $(if ($diffEasy -gt 0) { "warn" } else { "pass" })
    Write-Check "Simple (in recipes)" $diffSimple "pass"
    Write-Check "Medium (general)" $terms["Medium"] "info"
    Write-Check "Complex (in recipes)" $diffComplex "pass"
    Write-Check "Hard (in recipes)" $diffHard $(if ($diffHard -gt 0) { "warn" } else { "pass" })
    
    if ($diffEasy -gt 0 -or $diffHard -gt 0) {
        Write-Host ""
        Write-Host "  ⚠️  INCONSISTENCY: Some recipes use 'Easy'/'Hard' instead of 'Simple'/'Complex'" -ForegroundColor Yellow
    }
    
    return @{
        RecipeEasy    = $diffEasy
        RecipeSimple  = $diffSimple
        RecipeHard    = $diffHard
        RecipeComplex = $diffComplex
    }
}

function Analyze-IBSTerms {
    param([string]$Content)
    
    Write-Section "IBS TERMINOLOGY"
    
    # Use ordered dictionary to avoid case-insensitive key collision
    $ibsFriendlyUpper = ([regex]::Matches($Content, 'IBS-Friendly')).Count
    $ibsFriendlyLower = ([regex]::Matches($Content, 'IBS-friendly')).Count
    $lowFodmapMixed = ([regex]::Matches($Content, 'Low-FODMAP')).Count
    $lowFodmapUpper = ([regex]::Matches($Content, 'LOW-FODMAP')).Count
    
    Write-Check "IBS-Friendly (correct)" "$ibsFriendlyUpper occurrences" "pass"
    Write-Check "IBS-friendly (lowercase)" "$ibsFriendlyLower occurrences" $(if ($ibsFriendlyLower -gt 0) { "warn" } else { "pass" })
    Write-Check "Low-FODMAP" "$lowFodmapMixed occurrences" "info"
    Write-Check "LOW-FODMAP" "$lowFodmapUpper occurrences" "info"
    
    if ($ibsFriendlyLower -gt 0) {
        Write-Host "  ⚠️  Minor: $ibsFriendlyLower lowercase 'IBS-friendly' (prefer 'IBS-Friendly')" -ForegroundColor Yellow
    }
    
    return @{
        IBSFriendlyUpper = $ibsFriendlyUpper
        IBSFriendlyLower = $ibsFriendlyLower
        LowFodmapMixed   = $lowFodmapMixed
        LowFodmapUpper   = $lowFodmapUpper
    }
}

function Analyze-Typos {
    param([string]$Content)
    
    Write-Section "TYPO DETECTION"
    
    $doubledWords = @("the the", "a a", "to to", "is is", "and and", "in in", "of of")
    $misspellings = @("recieve", "seperate", "occured", "definately", "accomodate", "occassion")
    
    $issues = @()
    
    Write-Host "  Checking doubled words..." -ForegroundColor Gray
    foreach ($word in $doubledWords) {
        $count = ([regex]::Matches($Content, "\b$word\b", 'IgnoreCase')).Count
        if ($count -gt 0) {
            $issues += "Doubled word '$word': $count occurrences"
            Write-Check "'$word'" "$count found" "fail"
        }
    }
    
    Write-Host "  Checking common misspellings..." -ForegroundColor Gray
    foreach ($word in $misspellings) {
        $count = ([regex]::Matches($Content, "\b$word\b", 'IgnoreCase')).Count
        if ($count -gt 0) {
            $issues += "Misspelling '$word': $count occurrences"
            Write-Check "'$word'" "$count found" "fail"
        }
    }
    
    if ($issues.Count -eq 0) {
        Write-Check "All checks" "PASSED" "pass"
    }
    
    return $issues
}

function Analyze-CharacterPronouns {
    param([string]$Content)
    
    Write-Section "PRONOUN CONSISTENCY"
    
    $issues = @()
    
    # Check Jolly (female) isn't referred to as "he"
    $jollyHe = [regex]::Matches($Content, 'Jolly.{0,30}\b(He|he|His|his)\b')
    if ($jollyHe.Count -gt 0) {
        Write-Check "Jolly (she/her)" "$($jollyHe.Count) 'he/his' found" "fail"
        $issues += "Jolly incorrectly referred to as 'he': $($jollyHe.Count) occurrences"
    }
    else {
        Write-Check "Jolly (she/her)" "Correct" "pass"
    }
    
    # Check Freddy (male) isn't referred to as "she"
    $freddyShe = [regex]::Matches($Content, 'Freddy.{0,30}\b(She|she|Her|her)\b')
    if ($freddyShe.Count -gt 0) {
        Write-Check "Freddy (he/him)" "$($freddyShe.Count) 'she/her' found" "fail"
        $issues += "Freddy incorrectly referred to as 'she': $($freddyShe.Count) occurrences"
    }
    else {
        Write-Check "Freddy (he/him)" "Correct" "pass"
    }
    
    return $issues
}

function Analyze-ChapterNumbering {
    param([string]$Content)
    
    Write-Section "CHAPTER STRUCTURE"
    
    $chapters = [regex]::Matches($Content, 'Chapter (\d+):')
    $chapterNums = $chapters | ForEach-Object { $_.Groups[1].Value }
    $duplicates = $chapterNums | Group-Object | Where-Object { $_.Count -gt 1 }
    
    Write-Check "Total chapter headers" $chapters.Count "info"
    
    if ($duplicates) {
        Write-Host "  ⚠️  Note: Front matter and recipes both use 'Chapter' numbering" -ForegroundColor Yellow
        foreach ($dup in $duplicates) {
            Write-Host "       Chapter $($dup.Name) appears $($dup.Count) times" -ForegroundColor Gray
        }
    }
}

function Analyze-EmojiConsistency {
    param([string]$Content)
    
    Write-Section "CHARACTER EMOJI CHECK"
    
    # Check for Jolly with wrong emoji (🐕 instead of 🐩)
    $jollyWrongEmoji = [regex]::Matches($Content, 'Jolly.{0,3}🐕|🐕.{0,3}Jolly')
    if ($jollyWrongEmoji.Count -gt 0) {
        Write-Check "Jolly should be 🐩 (poodle)" "$($jollyWrongEmoji.Count) uses 🐕" "fail"
    }
    else {
        Write-Check "Jolly emoji (🐩)" "Correct" "pass"
    }
    
    # Note: 🐕 is still valid for "dog-safe treat" tags, just not for Jolly specifically
}

# ============================================
# MAIN EXECUTION
# ============================================

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║   THE ALEX COOKBOOK - AUTOMATED QA ANALYSIS      ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Magenta

# Check if PDF exists
$fullPdfPath = Resolve-Path $PdfPath -ErrorAction SilentlyContinue
if (-not $fullPdfPath) {
    Write-Host "❌ PDF not found: $PdfPath" -ForegroundColor Red
    Write-Host "   Run .\build\build-pdf.ps1 first to generate the PDF." -ForegroundColor Yellow
    exit 1
}

Write-Host "📄 Analyzing: $fullPdfPath" -ForegroundColor Cyan

# Extract text
$textPath = [System.IO.Path]::ChangeExtension($fullPdfPath, ".txt")
if (-not (Extract-PdfText -PdfPath $fullPdfPath -OutputPath $textPath)) {
    exit 1
}

# Read content
$content = Get-Content $textPath -Raw

# Run all analyses
$stats = Analyze-DocumentStats -Content $content
$family = Analyze-FamilyMentions -Content $content
$difficulty = Analyze-DifficultyTerms -Content $content
$ibs = Analyze-IBSTerms -Content $content
$typos = Analyze-Typos -Content $content
$pronouns = Analyze-CharacterPronouns -Content $content
Analyze-ChapterNumbering -Content $content
Analyze-EmojiConsistency -Content $content

# Summary
Write-Section "SUMMARY"

$issues = @()
if ($difficulty.RecipeEasy -gt 0) { $issues += "- $($difficulty.RecipeEasy) recipes use 'Easy' instead of 'Simple'" }
if ($difficulty.RecipeHard -gt 0) { $issues += "- $($difficulty.RecipeHard) recipes use 'Hard' instead of 'Complex'" }
if ($ibs.IBSFriendlyLower -gt 0) { $issues += "- $($ibs.IBSFriendlyLower) lowercase 'IBS-friendly'" }
$issues += $typos
$issues += $pronouns

if ($issues.Count -eq 0) {
    Write-Host "  ✅ ALL CHECKS PASSED!" -ForegroundColor Green
}
else {
    Write-Host "  ⚠️  Issues found:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "     $issue" -ForegroundColor Gray
    }
}

# Save report if requested
if ($OutputReport) {
    $report = @"
THE ALEX COOKBOOK - QA REPORT
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
PDF: $fullPdfPath

DOCUMENT STATISTICS
-------------------
Lines: $($stats.Lines)
Characters: $($stats.Characters)
Words: $($stats.Words)
Estimated Pages: ~$($stats.EstimatedPages)

FAMILY MENTIONS
---------------
$(($family.Keys | ForEach-Object { "$_`: $($family[$_])" }) -join "`n")

DIFFICULTY TERMS (in recipe headers)
------------------------------------
Easy: $($difficulty.RecipeEasy)
Simple: $($difficulty.RecipeSimple)
Hard: $($difficulty.RecipeHard)
Complex: $($difficulty.RecipeComplex)

ISSUES
------
$($issues -join "`n")
"@
    $report | Out-File $OutputReport -Encoding UTF8
    Write-Host ""
    Write-Host "📝 Report saved to: $OutputReport" -ForegroundColor Green
}

Write-Host ""
Write-Host "🍳 QA Analysis Complete!" -ForegroundColor Green
