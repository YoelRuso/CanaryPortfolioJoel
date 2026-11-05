# Submission: AWS Student Builder Challenge

## Title

My island as a 3D sea chart: a portfolio steered by a scripted pilot

## Description

My portfolio is a 3D relief model of Gran Canaria, built from real elevation data, that follows you down the page. A scripted pilot sails its boat round the island to each section. Hosted on AWS Amplify and deployed by GitHub Actions through IAM OIDC, with no stored keys.

## Body (Markdown)

- **Live site:** https://main.d1zb8l9pcqy7u2.amplifyapp.com
- **Code:** https://github.com/YoelRuso/CanaryPortfolioJoel

I'm Joel, a final-year Computer Engineering student at ULPGC in Las Palmas de Gran Canaria. I study on an island, so I drew my portfolio as a sea chart of it.

[SCREENSHOT: the site on desktop]

### The creative feature: a pilot on board

In a port, the pilot is the person who boards your ship and steers it in. On my site, the pilot steers you.

- **How to find it:** a button that's always on screen, "Ask the pilot", flying the international code flag H, which means "I have a pilot on board". The hero also has a "Take the pilot's tour" button.
- **What it does:** you pick a port or type a topic ("take me to Snake", "AWS", "highest point"). The pilot's boat sails the course on the 3D island while the camera follows it, then the page docks at that section and opens the project's notes.
- **What it is not:** an AI. It's a script of written answers that runs in your browser, with no server and no cost, and it says so if you ask.
- **It never gets in the way:** close it with Esc or the ✕, and the whole site works without it. It works with keyboard, mouse and touch, and respects `prefers-reduced-motion`.

[SCREENSHOT: the pilot sailing to a project]

### The island that travels with you

The coastline and mountains come from real elevation data: Terrain Tiles from the **AWS Open Data registry**, cut into layers every 300 m and stacked in CSS 3D. Scrolling moves a camera from port to port: Puerto de la Luz for About, Agaete for Skills, and Mogán for Projects, where each project is a buoy off the coast. The whole site is plain HTML, CSS and JavaScript, with no build step and no frameworks.

[SCREENSHOT: the site on mobile]

### Life on the island

The chart isn't still. Gulls circle over the ports, a fish leaps out of the sea now and then, and a pair of dolphins jumps beside the pilot's boat while it sails. On the south tip stands the Maspalomas lighthouse, at its real position, with a chart label and the magenta light flare nautical charts use. The moon button in the header (or asking the pilot for "night") turns the chart to moonlight, and the lighthouse lights up. The speaker button adds calm waves and a ship's horn when the boat sets sail, made in the browser with the Web Audio API. Sound and night are always off until you turn them on, and nothing moves for visitors who prefer reduced motion.

[SCREENSHOT: the lighthouse at night]

### Why no framework

I built everything with plain HTML, CSS and JavaScript on purpose. I didn't want a pile of dependencies I wasn't going to use, and I wanted to show that you can build something rich without a framework: the browser already has everything this site needs.

- **Zero dependencies:** no npm packages and no build step. Even the scripts that turn the elevation data into map layers only use what Node.js has built in.
- **Light:** the whole site, including the 13 map layers, weighs about 65 KB compressed.
- **The browser does the heavy lifting:** CSS 3D transforms and custom properties for the island, `<details>` for the project notes, `IntersectionObserver` for the menu, and `prefers-reduced-motion` for accessibility.
- **Simple, fast deployment:** with nothing to compile, the pipeline just tests, zips and uploads the files to Amplify.
- **Nothing to keep patched:** no dependency means no vulnerable dependency to update, and the site will still run as it is in years.
- **Readable:** what you see with "view source" is the real code, file by file.

A framework makes sense for a big app with a lot of state. For a portfolio, it would have been weight without a purpose.

### AWS services and how they're set up

- **AWS Amplify Hosting** (eu-north-1): the app is set up without a Git connection, as manual deployments that GitHub Actions creates.
- **AWS IAM**: an OpenID Connect provider for GitHub and a deploy role. Only this repository's `production` environment can assume the role, and it can only deploy the `main` branch of this one app (`CreateDeployment`, `StartDeployment`, `GetJob`, `GetApp`). No AWS keys are stored anywhere.
- **GitHub Actions** CI/CD: every push runs the tests (JavaScript syntax and HTML validation). A push to `main` that passes is zipped, uploaded to Amplify, deployed and checked until it succeeds, in about 40 seconds.
- **AWS Open Data**: the elevation tiles behind the map, downloaded once and turned into SVG layers by a script.

[SCREENSHOT: Amplify app with the successful deployment]
[SCREENSHOT: GitHub Actions run with tests and deploy in green]
[SCREENSHOT: IAM role trust policy]

### Challenges and how I solved them

- **Blurry 3D layers:** zooming in magnified a low-resolution bitmap. I lay the layers out larger than they appear and let the camera scale them down, so the browser rasterises them with more detail.
- **Flicker and GPU memory:** the layers were full 1000×1000 squares, mostly transparent. Cropping each one to its content cut GPU memory from about 123 MB to 50 MB, and removing animations that forced redraws stopped the flicker.
- **The boat was hidden by land, clouds and panels:** it's now drawn in 2D above everything, at the projected position of its 3D course.
- **OIDC "Not authorized":** my repository uses GitHub's newer subject claim, which includes numeric IDs (`repo:Owner@id/Repo@id:...`), and my trust policy only had the classic format. After that, `CreateDeployment` needed the `branches/main/deployments/*` resource. Both are documented in the repo.
- **Sea depth data:** the public tiles are too coarse near the coast, so the sea bands are stylised from the real coastline, and the site says so.
- **The boat sailed over land:** one stretch of the course crossed La Isleta. I wrote a small test that samples the route and checks every point against the real coastline: 13 points were on land; the new route has none and stays about 2.6 km offshore.
- **Accessibility pass:** a browser test found that the keyboard could land on island labels hidden behind panels, a focus ring that vanished on dark backgrounds, and the pilot docking on text its own panel covered. All three are fixed. Lighthouse gives 100 for accessibility, best practices and SEO.

### What I learned

Building in 3D taught me that performance isn't something you fix at the end: every layer, animation and image has a cost. Cropping the layers to their content and cutting animations that forced redraws took GPU memory from about 123 MB to 50 MB and removed the flicker.

I also discovered the AWS Open Data registry. I didn't know that elevation data for the whole planet, like the Terrain Tiles behind my island, was freely available on AWS, ready to use in a project.

### How I built it

I made the decisions (the concept, the creative feature, the 3D direction, every review) and worked with an AI coding agent that wrote most of the code under my direction. Using AI is allowed in this challenge, and the full log of milestones, challenges and who did what is in `DEVLOG.md` in the repository.

## Form fields

- **Tags (max. 5):** aws, amplify, github-actions, portfolio, javascript (pick the closest ones the form offers)
- **GitHub repository:** https://github.com/YoelRuso/CanaryPortfolioJoel
- **Live endpoint:** https://main.d1zb8l9pcqy7u2.amplifyapp.com
- **Cover image:** a desktop screenshot of the hero, cropped to 1200 × 675 px (max. 2 MB, without text added)
