@echo off
echo ===================================================
echo   Starting MCP Web Analyzer (Backend + Frontend)
echo ===================================================

echo [1/2] Starting MCP Backend on Port 4000...
start "MCP Backend" cmd /k "cd mcp_backend && npm run dev"

echo [2/2] Starting Next.js Frontend on Port 3000...
start "Next.js Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both services are booting up!
echo Frontend will be accessible at: http://localhost:3000
echo Backend API at:                 http://localhost:4000
echo.
