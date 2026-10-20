@echo off
setlocal
cd /d "%~dp0"
title Industry Insight HTS

echo ====================================================
echo  Industry Insight HTS Launcher
echo ====================================================

set NODE_EXE=

if exist "%APPDATA%\Antigravity\bin\agy-node.cmd" (
    set NODE_EXE="%APPDATA%\Antigravity\bin\agy-node.cmd"
    goto START_SERVER
)

where agy-node.cmd >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set NODE_EXE=agy-node.cmd
    goto START_SERVER
)

where node.exe >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set NODE_EXE=node.exe
    goto START_SERVER
)

echo [Notice] Opening index.html directly in browser...
start "" "%~dp0index.html"
goto DONE

:START_SERVER
echo Starting local server at http://localhost:3000 ...
start "" "http://localhost:3000"
call %NODE_EXE% server.js

:DONE
endlocal
