# Workflow Screenshot Placeholders

This directory contains screenshots for the "Run Your First Workflow" guide.

## Required Screenshots

1. **step1-builder-interface.png**: Clean builder interface with empty canvas
2. **step2-add-start-node.png**: Canvas with Start node added
3. **step3-add-http-node.png**: Canvas with Start and HTTP nodes (disconnected)
4. **step4-connect-nodes.png**: Nodes connected with arrow
5. **step5-configure-http.png**: Inspector panel showing HTTP configuration
6. **step6-export-workflow.png**: Export dialog/button highlighted
7. **step7-run-workflow.png**: Workflow running with status indicators
8. **step8-check-results.png**: Completed workflow with success status

## Screenshot Guidelines

- **Resolution**: 1920x1080 or higher
- **Format**: PNG for clarity
- **Content**: Focus on the relevant UI element for each step
- **Annotations**: Add arrows or highlights where helpful
- **Consistency**: Use the same browser/theme across all screenshots

## Capturing Screenshots

1. Start the dev server: `pnpm -C apps/dev-web dev`
2. Open http://localhost:3000 in a clean browser window
3. Follow the guide steps and capture each stage
4. Save images with the exact filenames listed above

## Discord Webhook Setup for Testing

To capture authentic screenshots:

1. Create a test Discord server
2. Set up a webhook in a dedicated #test-automation channel
3. Use this webhook URL in your HTTP node configuration
4. This ensures the screenshots show real, working integrations
