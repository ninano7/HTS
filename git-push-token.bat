@echo off
setlocal
cd /d "%~dp0"
title HTS GitHub Token Push

echo ====================================================
echo  HTS GitHub Push (Personal Access Token ?몄쬆)
echo ====================================================
echo.
echo * GitHub??怨꾩젙 鍮꾨?踰덊샇 濡쒓렇?몄쓣 吏?먰븯吏 ?딆쑝誘濡?echo   Personal Access Token(ghp_...)???꾩슂?⑸땲??
echo.
echo [?좏겙 諛쒓툒 30珥??덈궡]
echo 1) github.com 濡쒓렇?????곗륫 ?곷떒 ?꾨줈???대┃ - Settings
echo 2) 醫뚯륫 留??꾨옒 Developer settings - Personal access tokens - Tokens (classic)
echo 3) Generate new token (classic) ?대┃
echo 4) 'repo' 泥댄겕諛뺤뒪 泥댄겕 ???섎떒 Generate token ?대┃?섏뿬 蹂듭궗
echo.
echo ====================================================
set /p GITHUB_TOKEN="GitHub ?좏겙(ghp_...)??留덉슦???고겢由?쑝濡?遺숈뿬?ｊ퀬 ?뷀꽣瑜??꾨Ⅴ?몄슂: "

if "%GITHUB_TOKEN%"=="" (
    echo [?ㅻ쪟] ?좏겙???낅젰?섏? ?딆븯?듬땲??
    pause
    exit /b 1
)

echo.
echo ?몄떆瑜?吏꾪뻾?⑸땲??..
set GIT_CMD="C:\Users\HPE\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"

%GIT_CMD% remote set-url origin https://ninano7:%GITHUB_TOKEN%@github.com/ninano7/HTS.git
%GIT_CMD% push -u origin main

set PUSH_STATUS=%ERRORLEVEL%

rem 蹂댁븞???꾪빐 ?먭꺽 URL?먯꽌 ?좏겙 利됱떆 ?쒓굅
%GIT_CMD% remote set-url origin https://github.com/ninano7/HTS.git

echo.
if %PUSH_STATUS% EQU 0 (
    echo ====================================================
    echo  [?깃났] https://github.com/ninano7/HTS 濡??몄떆媛 ?꾨즺?섏뿀?듬땲??
    echo ====================================================
) else (
    echo ====================================================
    echo  [?ㅽ뙣] ?좏겙???щ컮瑜댁? ?딄굅??沅뚰븳???놁뒿?덈떎. ?ㅼ떆 ?뺤씤?댁＜?몄슂.
    echo ====================================================
)

pause
endlocal
