@echo off
setlocal enabledelayedexpansion
echo === Procurando arquivos com extensoes .TS e .TSX (case-sensitive no Git/Vercel) ===
set COUNT=0

for /r %%F in (*.TS *.TSX) do (
  echo %%F
  set /a COUNT+=1
)

echo.
echo Total encontrados: %COUNT%
if %COUNT% EQU 0 (
  echo Nao ha arquivos com .TS/.TSX. Tudo certo :)
) else (
  echo ATENCAO: arquivos acima devem ser renomeados para .ts/.tsx
)
endlocal
