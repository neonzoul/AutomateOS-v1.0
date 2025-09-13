# Run Your First Workflow — AutomateOS v1.0

Welcome to AutomateOS! This guide will walk you through creating and running your first workflow in just a few minutes.

**What you'll build**: A simple Discord notification workflow that sends a message when triggered.

**Time required**: ~5 minutes  
**Prerequisites**: AutomateOS running locally (see setup guide)

---

## 🚀 Quick Start

### Step 1: Open the Builder

1. Navigate to [http://localhost:3000](http://localhost:3000) in your browser
2. You'll see the AutomateOS Builder interface with an empty canvas

![Builder Interface](./images/step1-builder-interface.png)

_The Builder features a clean, visual canvas where you'll design your workflow by connecting nodes._

### Step 2: Add Your First Node

1. **Drag a Start node** from the node panel (left side) onto the canvas
2. Every workflow begins with exactly one **Start** node
3. Position it on the left side of the canvas

![Add Start Node](./images/step2-add-start-node.png)

_The Start node is your workflow's entry point — it has no configuration and simply begins execution._

### Step 3: Add an HTTP Node

1. **Drag an HTTP node** from the node panel onto the canvas
2. Position it to the right of the Start node
3. You now have two disconnected nodes

![Add HTTP Node](./images/step3-add-http-node.png)

_HTTP nodes let you make requests to any web API. We'll configure this to send a Discord message._

### Step 4: Connect the Nodes

1. **Click and drag** from the small circle on the right edge of the Start node
2. **Drop the connection** onto the HTTP node
3. You'll see an arrow connecting them

![Connect Nodes](./images/step4-connect-nodes.png)

_Connections define the flow of execution. Your workflow now goes: Start → HTTP._

### Step 5: Configure the HTTP Node

1. **Click on the HTTP node** to select it
2. The **Inspector panel** (right side) will show configuration options
3. Fill in the following details:
   - **Method**: Select `POST`
   - **URL**: Enter your Discord webhook URL
     ```
     https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
     ```
   - **Headers**: Click "Add Header" and enter:
     - Key: `Content-Type`
     - Value: `application/json`
   - **Body**: Enter the JSON payload:
     ```json
     {
       "content": "🎉 Hello from AutomateOS! Your first workflow is running successfully."
     }
     ```

![Configure HTTP Node](./images/step5-configure-http.png)

_The Inspector panel automatically generates forms based on each node type's schema._

### Step 6: Save Your Workflow (Optional)

1. Click the **Export** button in the top toolbar
2. Your workflow will download as a JSON file
3. You can import this later using the **Import** button

![Export Workflow](./images/step6-export-workflow.png)

_Import/Export enables sharing workflows and backing up your creations._

### Step 7: Run Your Workflow

1. Click the **▶ Run** button in the top-right corner
2. Watch the nodes change status:
   - **Blue pulse**: Running
   - **Green checkmark**: Success
   - **Red X**: Failed

![Run Workflow](./images/step7-run-workflow.png)

_Real-time status updates let you see exactly how your workflow executes._

### Step 8: Check the Results

1. **In Discord**: You should see your message appear in the target channel
2. **In the Builder**: Click on the HTTP node to see execution details in the Inspector
3. **Run logs**: View detailed logs in the right panel showing the HTTP response

![Check Results](./images/step8-check-results.png)

_Success! Your workflow executed and sent a message to Discord._

---

## 🎯 What You Just Learned

✅ **Visual workflow design** using drag-and-drop nodes  
✅ **Node configuration** via the dynamic Inspector panel  
✅ **Workflow execution** with real-time status updates  
✅ **Import/export** for sharing and backup  
✅ **HTTP integrations** for connecting to external APIs

---

## 🔧 Common Issues & Solutions

### Discord webhook not working?

**Problem**: "Invalid webhook URL" error  
**Solution**:

1. Go to your Discord server settings → Integrations → Webhooks
2. Create a new webhook and copy the full URL
3. Make sure the URL includes both the webhook ID and token

**Problem**: "403 Forbidden" error  
**Solution**: Check that your bot/webhook has permission to send messages to the target channel

### Node configuration not saving?

**Problem**: Changes reset when you click away  
**Solution**: Make sure to click outside the input field or press Enter to confirm changes

### Workflow won't run?

**Problem**: Run button does nothing  
**Solution**:

1. Ensure all nodes are connected (no orphaned nodes)
2. Verify your HTTP node has a valid URL
3. Check the browser console for error messages

---

## 🚀 Next Steps

Now that you've mastered the basics, try these next challenges:

1. **Add conditional logic** with branching paths
2. **Chain multiple HTTP calls** (e.g., get data, then post to Slack)
3. **Use input variables** to make workflows dynamic
4. **Build templates** to share with other creators

### Advanced Workflows to Explore

- **Stripe → Discord**: Get payment notifications in your Discord
- **GitHub → Slack**: Notify your team about new issues
- **Form → Email**: Process contact form submissions
- **Weather → Twitter**: Tweet daily weather updates

---

## 📚 Additional Resources

- **[API Reference](../api/API-Contract.md)**: Complete endpoint documentation
- **[Architecture Guide](../technical/dev-web/Architecture.md)**: How the Builder works internally
- **[Troubleshooting](../technical/E2E-Smoke-Test-Guide.md)**: Detailed debugging steps
- **[Community](https://github.com/neonzoul/AutomateOS-v1.0)**: Share workflows and get help

---

**Congratulations! 🎉** You've successfully created and run your first AutomateOS workflow. The visual builder makes it easy to connect services without writing code, and the real-time execution feedback helps you debug and iterate quickly.

Ready to automate your world? Start building more complex workflows and join our growing community of creators!
