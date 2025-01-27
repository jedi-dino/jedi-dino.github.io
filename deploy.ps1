# Stop on errors
$ErrorActionPreference = 'Stop'

try {
    # Build
    npm run build

    # Navigate into the build output directory
    Set-Location dist

    # Create 404.html for client-side routing
    Copy-Item index.html -Destination 404.html

    # Initialize git repo
    git init
    git add -A
    git commit -m "deploy"

    # Deploy to GitHub Pages
    # Replace <USERNAME> and <REPO> with your GitHub username and repository name
    git push -f git@github.com:<USERNAME>/<REPO>.git main:gh-pages

    # Return to original directory
    Set-Location ..

    Write-Host "Deployment completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Deployment failed: $_" -ForegroundColor Red
    exit 1
}
