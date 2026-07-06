@echo off
setlocal EnableDelayedExpansion

REM ============================================================
REM  run-loop.bat — Run Claude Code /loop with auto-retry
REM  on rate limit (checks hourly until replenished)
REM ============================================================

REM --- Configuration (edit as needed) -------------------------
set "GOAL=/loop"
set "LOG_FILE=%~dp0claude-loop.log"
set "TEMP_OUT=%~dp0claude-output-tmp.txt"
set "RETRY_WAIT_SEC=3600"
set "MAX_RETRIES=48"
REM ------------------------------------------------------------

set "RETRY_COUNT=0"

call :log "=================================================="
call :log "  Claude Loop Started"
call :log "  Goal  : %GOAL%"
call :log "  Retry : up to %MAX_RETRIES% times / every %RETRY_WAIT_SEC%s"
call :log "=================================================="

:RUN
set /a ATTEMPT=RETRY_COUNT+1
call :log "--- Attempt #%ATTEMPT% at %date% %time% ---"
echo.
echo [Attempt #%ATTEMPT%] Running: claude -p "%GOAL%"
echo.

REM Run Claude non-interactively;
REM stream to console and file
claude -p "%GOAL%" > "%TEMP_OUT%" 2>&1
set "EXIT=%ERRORLEVEL%"

REM Echo output to console and append to log
type "%TEMP_OUT%"
type "%TEMP_OUT%" >> "%LOG_FILE%"

REM --- Rate limit detection -----------------------------------
REM Claude Code emits various strings when the cap is hit.
findstr /i /r "rate.limit\|usage.limit\|limit.reached\|too.many.requests\|overloaded\|plan.limit\|claude.pro\|quota\|429\|529" "%TEMP_OUT%" > nul 2>&1
set "RATE_LIMITED=!ERRORLEVEL!"

if "!RATE_LIMITED!"=="0" goto HANDLE_LIMIT

REM --- Normal exit (success or non-rate-limit error) ----------
if "!EXIT!"=="0" (
    call :log ">>> Completed successfully."
    echo.
    echo Claude loop completed successfully.
) else (
    call :log ">>> Exited with code !EXIT! (not a rate limit)."
    echo.
    echo Claude loop ended with exit code: !EXIT!
)
goto DONE

REM --- Rate limit handling ------------------------------------
:HANDLE_LIMIT
set /a RETRY_COUNT+=1

if !RETRY_COUNT! GEQ %MAX_RETRIES% (
    call :log ">>> Max retries (%MAX_RETRIES%) reached. Giving up."
    echo Max retries reached. Exiting.
    goto DONE
)

call :log ">>> Rate limit hit (attempt %ATTEMPT%). Waiting %RETRY_WAIT_SEC%s before retry !RETRY_COUNT!/%MAX_RETRIES%..."
echo.
echo Rate limit detected on attempt #%ATTEMPT%.
echo Next retry: !RETRY_COUNT!/%MAX_RETRIES% — waiting 1 hour...
echo Press Ctrl+C to abort.
echo.
timeout /t %RETRY_WAIT_SEC% /nobreak > nul
goto RUN

REM --- Done ---------------------------------------------------
:DONE
del "%TEMP_OUT%" 2>nul
call :log "=================================================="
call :log "  Session ended: %date% %time%"
call :log "=================================================="
echo.
echo Log saved to: %LOG_FILE%
endlocal
exit /b 0

REM --- Helper: timestamped log --------------------------------
:log
echo [%date% %time%] %~1 >> "%LOG_FILE%"
echo [%date% %time%] %~1
goto :eof