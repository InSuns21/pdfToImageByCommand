@echo off
cd /d %~dp0
setlocal
:LOOP
  set INPUT_PATH="%~1"
  echo %INPUT_PATH%
  call node index.js 
  shift
if not "%~1"=="" goto LOOP

endlocal

pause