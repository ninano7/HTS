@echo off
setlocal
cd /d "%~dp0"
title HTS Git Push

echo ====================================================
echo  GitHub ?ê²© ?€?¥ì†Œ (ninano7/HTS) ë¡??¸ì‹œ?©ë‹ˆ??..
echo ====================================================
echo.
echo * ìµœì´ˆ ?¸ì‹œ ??ë¸Œë¼?°ì???GitHub ë¡œê·¸???¹ì¸ ì°½ì´ ?˜í??©ë‹ˆ??
echo * ë¸Œë¼?°ì??ì„œ 'Sign in with your browser' ë¥??´ë¦­?˜ì—¬ ?¹ì¸?´ì£¼?¸ìš”.
echo.

set GIT_EXE="C:\Users\HPE\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"

%GIT_EXE% push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo [?±ê³µ] GitHub ?¸ì‹œê°€ ?„ë£Œ?˜ì—ˆ?µë‹ˆ??
) else (
    echo [?ˆë‚´] ?¸ì‹œ ?„ì¤‘ ì·¨ì†Œ?˜ì—ˆê±°ë‚˜ ?¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.
)
echo ====================================================
pause
endlocal
