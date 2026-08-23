---
sidebarTitle: "2. Create Your First Agent"
title: "Create Your First Agent"
---

Build a chat Agent in **canvas**: a trigger that receives the message, a model that thinks, and a response that streams back. Ten minutes, no code.

## Before you begin

Your universe is running and open in a browser. Locally that is `unoverse start`, and
**canvas** is at http://localhost:3001.

You have an OpenAI API key, and the OpenAI package is installed from the
[marketplace](/onboarding/marketplace-nodes).

## Build it

<Steps>
<Step title="Add your OpenAI credential">

In **canvas**, open **Credentials** and click **New credential**. Select the **OpenAI API** type, name it, paste your API key, and save. Nodes never read keys from config or env files; they request credentials at execution time, decrypted and injected by the platform.

![The Credentials page in Canvas](../images/credentials.png)

</Step>
<Step title="Create a workflow">

Open **Workflows** and click **Create New Workflow**, then name it. An empty **canvas**
opens, ready for nodes. This comes first: nodes live in a workflow, so there is nowhere to
drop one until you have made it.

![Creating a new workflow in Canvas](../images/onboarding/newWorkfloew.png)

</Step>
<Step title="Add three nodes">

The workflow needs three nodes:

1. <span className="node-chip">Input Trigger</span> receives the user's message.
2. <span className="node-chip">OpenAI Stream</span> sends it to the model and streams the reply.
3. <span className="node-chip">Streaming Text</span> displays the reply to the user.

Drag <span className="node-chip">Input Trigger</span> and <span className="node-chip">OpenAI Stream</span> from the node library onto the **canvas**.

![An Input Trigger node on the canvas](../images/onboarding/inputTrigger.png)

<span className="node-chip">Streaming Text</span> is a component rather than a node, so it comes from **studio** in your universe. Open **studio**, then **Components**, select **StreamingText** and click **Copy for Canvas**. Paste it onto your canvas.

![The StreamingText component in Studio with Copy for Canvas](../images/onboarding/AIResponce.png)

Now connect them left to right: <span className="node-chip">Input Trigger</span> → <span className="node-chip">OpenAI Stream</span> → <span className="node-chip">Streaming Text</span>.

The dots on a node's edges are **connectors**. Each output connector carries one named signal. Hover over a connector to see its name and what it carries. The names matter: they are how downstream fields reference the data, as in `signal.openaistream1.stream`.

<span className="node-chip">OpenAI Stream</span> has more than one output, so pick the right one: connect from its `stream` connector. `stream` carries the live text, so the reply flows into <span className="node-chip">Streaming Text</span> as the model writes it.

![Hovering a connector shows its name and what it carries](../images/onboarding/connnector.png)

<Note>
Every node instance gets an id: its type in lowercase with the spaces removed, then a number. **Input Trigger** becomes `inputtrigger1`, and **OpenAI Stream** becomes `openaistream1`. Drop a second one and it takes the next number.

Downstream nodes read upstream outputs through these ids: `signal.<nodeId>.<output>`.
</Note>

</Step>
<Step title="Set a test message">

Double-click <span className="node-chip">Input Trigger</span> to open its settings. Under **Testing**, enter a **Message**. This is the question that kicks off the flow when you run the trigger.

![Setting a test message on Input Trigger](../images/onboarding/SetTestMessage.png)

</Step>
<Step title="Configure the model">

Double-click <span className="node-chip">OpenAI Stream</span> to open its settings:

- **OpenAI API**: select the credential you created in step 1.
- **Model**: pick a GPT-5.6 variant.
- **System Prompt**: `You are a helpful assistant. Please answer the user's question.`
- **User Prompt**: `The user's question is {{signal.inputtrigger1.output.message}}`

![The OpenAI Stream settings panel](../images/onboarding/settings.png)

The double braces are a Handlebars reference: at run time it resolves to the message the trigger received.

Open the prompt editor on that field to see what you can reference. **Test Data** shows the
real shape of the signal, so you can read the field names off it instead of guessing, and
**Run** resolves your template against that data before you run the workflow.

![The prompt editor, with the template on the left and the test data on the right](../images/onboarding/prompt-editor.png)

</Step>
<Step title="Configure the response">

Double-click <span className="node-chip">Streaming Text</span>:

- **Main response text**: `return signal.openaistream1.stream`

This field takes JavaScript. `stream` is the model's streaming output, so text appears live as the model writes. The complete reply is also available as `signal.openaistream1.text` once the node finishes.

<Note>
Config fields accept two syntaxes: Handlebars (`{{signal...}}`) for templating text, and JavaScript (`return signal...`) for computing a value. Use either; don't mix them in one field.
</Note>

</Step>
<Step title="Step through it">

Your workflow saves automatically as you build; there is no save button. Just run it: press the play button on <span className="node-chip">Input Trigger</span> to execute it with your test message. When a node completes, the next node in the chain becomes **armed** and flashes, meaning it is ready to run. Press its play button to step forward, inspecting each node's output as you go.

![Input Trigger completed, OpenAI Stream armed and ready to step](../images/onboarding/stepDebug.png)

The moment a node runs, its output is ready to inspect. Double-click the node and open the **Debug** tab. It shows every signal the node produced and the exact value each one carried on this run.

![The Debug tab showing OpenAI Stream's output](../images/onboarding/debug.png)

Step through all three nodes and watch the reply stream into <span className="node-chip">Streaming Text</span>.

</Step>
</Steps>

## Next steps

<Card title="Create your first node" icon="box" href="/onboarding/create-your-first-node" horizontal>
Extend the platform with your own logic.
</Card>

<Card title="Ingest content to Spatial" icon="globe" href="/onboarding/ingest-content-to-spatial" horizontal>
Ground your Agent's answers in your own content.
</Card>
