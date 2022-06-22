# Docs for the Azure Web Apps Deploy action: https://github.com/Azure/webapps-deploy
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy Node.js app to Azure Web App - meta-detector

on:
  push:
    branches:
      - master
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Set up Node.js version
        uses: actions/setup-node@v1
        with:
          node-version: '14.x'

      - name: npm install, build, and test
        run: |
          npm install
          npm run build --if-present

      - name: Upload artifact for deployment job
        uses: actions/upload-artifact@v2
        with:
          name: node-app
          path: .
  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: 'Production'
      url: ${{ steps.deploy-to-webapp.outputs.webapp-url }}

    steps:
      - name: Download artifact from build job
        uses: actions/download-artifact@v2
        with:
          name: node-app

      - name: 'Deploy to Azure Web App'
        id: deploy-to-webapp
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'meta-detector'
          slot-name: 'Production'
          publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE_304A44C6F417408FAC91E3447675562E }}
          package: .
          
      - name: Remove artifacts
      # You may pin to the exact commit or the version.
      # uses: c-hive/gha-remove-artifacts@24dc23384a1fa6a058b79c73727ae0cb2200ca4c
        uses: c-hive/gha-remove-artifacts@v1.2.0
        with:
          # Artifacts older than this will be deleted (e.g. "2 months", "1 day"). Parsed by moment.
          age: "1 seconds"
          # Access token for the repository, available under the same name in secrets.
          GITHUB_TOKEN: ${{ github.token }}
          # true/false. If enabled, tag build artifacts (e.g. release artifacts) will be kept.
          skip-tags: false
          # Keep the specified number of artifacts even if they are older than the age.
          skip-recent: 0
