---
sidebarTitle: "unoverse CLI"
title: "unoverse CLI"
---

`unoverse` is the one command for everything you do on the platform. Install it once and
you can:

- create a project, a universe or a client app
- author components, nodes and skills in **studio**
- run a universe on your machine, and deploy it to your own server

```bash Install it once
npm install -g unoverse
```

```bash Update it whenever
unoverse update
```

One command brings the CLI, your skills and a local universe's images current. Run it
inside a universe and it moves the running services to the latest images, without ever
booting a stopped one.

<div className="skill-callout">
<div className="skill-eyebrow">✦ Included, and installed for you</div>
<div className="skill-title">skills</div>
Build for unoverse by describing what you want. The skills teach Claude Code how the platform works, so what it writes actually runs. Components, nodes, workflows and themes are all fair game.
<br /><br />
`unoverse update` installs them. There is nothing to set up. [See what you get](/onboarding/skills).
</div>

Which commands you get depends on where you are standing. The CLI finds a universe the way
git finds a repo, by walking up from where you are.

Running a universe of your own needs a licence and the registry token issued with it.
Authoring needs neither. [Two ways to use
unoverse](/onboarding/how-it-fits-together#two-ways-to-use-unoverse) covers the difference.

## Help

```bash
unoverse help
```

Outside a universe, that is the whole surface:

```ansi unoverse help
  [36m⬡[0m [1munoverse[0m

  [2mBuild agent-powered apps. Interfaces as data, workflows on a canvas,[0m
  [2magent skills in plain markdown.[0m

  [1mFirst time[0m
    [32mcreate[0m          Asks what you're building, then sets it up

  [1mAfter that[0m
    [32mstudio[0m          Design components, nodes and agent skills
    [32mdeploy[0m          Ship it
      [2mdeploy studio         your components, nodes and skills → your universe[0m
      [2mdeploy aws            your universe → AWS[0m
      [2mdeploy digitalocean   your universe → DigitalOcean[0m
    [32mlogin[0m           Sign in to a universe (deploy asks by itself when needed)
    [32mupdate[0m          Update this CLI
```

Inside a universe folder, a second block appears. You will not see these before then,
because there is nothing yet for them to operate:

```ansi unoverse help
  [1mThis universe[0m
    [32mstart[0m       Start it [2m(--pull for the latest images)[0m
    [32mstop[0m        Stop it
    [32mcheck[0m       Is it healthy [2m(services, schema, environment)[0m
    [32mlogs[0m        What is it doing [2m(unoverse logs <service> for one)[0m
    [32mdestroy[0m     Take it down [2m(shows what goes, and what stays)[0m
                [2munoverse destroy aws   ·   unoverse destroy digitalocean[0m
    [32mdb-allow[0m    Let this machine reach the database [2m(run it when you change network)[0m
```

A bare `unoverse`, `unoverse --help` and `unoverse -h` all print the same thing.

## The commands

Two work wherever you are: `unoverse create` sets up a project, a universe or a client app, and
`unoverse update` brings your tooling current. The rest depend on where you are standing.

### studio

| Command | What it does |
| --- | --- |
| `unoverse studio` | Launches **studio**, downloading it on first run. |
| `unoverse login` | Signs in to a universe and remembers it in `unoverse.yaml`. |

### A universe

Available inside a universe folder.

| Command | What it does |
| --- | --- |
| `unoverse start` | Starts all services, pulling any missing images. `start --pull` refreshes to the latest images first. |
| `unoverse stop` | Stops all services. |
| `unoverse check` | One health answer: containers and endpoints, database schema, and the deeper environment diagnosis. |
| `unoverse logs` | Opens the Dozzle log viewer. `unoverse logs <service>` streams one service's logs in the terminal. |
| `unoverse where` | Prints your universe's addresses, local and deployed, probed live. |
| `unoverse destroy` | Takes the deployment down, showing what goes and what stays. Name the ground when you have two: `unoverse destroy aws`. |
| `unoverse db-allow` | Lets this machine reach the database. Run it when your network changes. |
