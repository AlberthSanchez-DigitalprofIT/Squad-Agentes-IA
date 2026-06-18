$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')
git add -A
git commit -m "Initial commit"
gh repo create Squad-Agentes-IA --private --source=. --push
