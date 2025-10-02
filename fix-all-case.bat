@echo off
setlocal enabledelayedexpansion
echo === Corrigindo extensoes .TS -> .ts e .TSX -> .tsx (forcando via temp) ===

REM Primeiro .TS -> .ts
set COUNT_TS=0
for /r %%F in (*.TS) do (
  set "FULL=%%~fF"
  set "DIR=%%~dpF"
  set "BASE=%%~nF"
  echo.
  echo [TS ] %%F
  echo git mv "%%F" "!DIR!!BASE!.temp"
  git mv "%%F" "!DIR!!BASE!.temp"
  echo git mv "!DIR!!BASE!.temp" "!DIR!!BASE!.ts"
  git mv "!DIR!!BASE!.temp" "!DIR!!BASE!.ts"
  set /a COUNT_TS+=1
)

REM Depois .TSX -> .tsx
set COUNT_TSX=0
for /r %%F in (*.TSX) do (
  set "FULL=%%~fF"
  set "DIR=%%~dpF"
  set "BASE=%%~nF"
  echo.
  echo [TSX] %%F
  echo git mv "%%F" "!DIR!!BASE!.temp"
  git mv "%%F" "!DIR!!BASE!.temp"
  echo git mv "!DIR!!BASE!.temp" "!DIR!!BASE!.tsx"
  git mv "!DIR!!BASE!.temp" "!DIR!!BASE!.tsx"
  set /a COUNT_TSX+=1
)

echo.
echo === Resumo ===
echo Renomeados .TS  : %COUNT_TS%
echo Renomeados .TSX : %COUNT_TSX%

echo.
echo Proximo passo:
echo   git add .
echo   git commit -m "fix: normalizar extensoes para .ts/.tsx (Windows case fix)"
echo   git push origin desenvolvimento

endlocal
