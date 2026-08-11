# F1 Alternate Universe

FORMULA ARCHIVE — REBUILD BRIEF

I have attached a working HTML prototype for a game called Formula Archive.

This prototype has been developed and extensively gameplay-tested already. The underlying game design, simulation behaviour, probabilities, ratings, opponent generation, collection mechanics, shiny system and achievements are intentional.

Your job is NOT to redesign the game mechanics.

Your job is to rebuild this prototype as a polished, modern, responsive web application while preserving the existing gameplay.

Please inspect the attached HTML carefully and use its JavaScript/database as the source of truth for the existing game logic.

THE CORE CONCEPT

Formula Archive is a highly replayable Formula 1 alternate-history collection/simulation game.

The player:

Chooses Easy or Hard difficulty.

Selects an F1 era using a dual-ended year-range slider.

Randomly rolls a season-specific F1 driver.

Randomly rolls a season-specific F1 car.

Creates a driver/car combination rated out of 200.

Faces a randomly generated field of similarly random historical driver/car combinations.

Simulates a 24-race Formula 1 season.

Sees their championship result, wins, podiums, DNFs and season story.

Adds discovered drivers/cars to their Formula Archive.

Hunts rare shiny versions and achievements.

Rolls again.

The central fantasy is:

“Create a believable alternate F1 universe where anything can happen.”

Strong combinations should generally succeed, weak combinations should generally struggle, but neither outcome should be completely predetermined.

The game should create moments such as:

Schumacher 2004 paired with a terrible Minardi.

Mazepin paired with one of the greatest cars ever made.

A midfield combination unexpectedly winning races.

A dominant combination somehow throwing away a championship.

A mediocre combination producing an unbelievable title run.

The balance between performance and randomness in the supplied prototype is intentional. Do not replace the simulation with a simple overall-rating comparison.

IMPORTANT: PRESERVE EXISTING LOGIC

Extract and preserve from the supplied prototype:

Driver database

Car database

Driver attributes

Car attributes

Overall ratings

Season/year data

Era filtering

Driver weighted selection

Car selection

Opponent generation

Opponent field distribution

Simulation calculations

Race randomness

Reliability/DNF behaviour

Points system

Championship standings

Easy/Hard behaviour

Reroll rules

Shiny probability

Collection persistence

Achievement triggers

Secret achievements

Career statistics

Run history

Refactoring the code is encouraged. Changing the intended game behaviour is not.

DIFFICULTY

Easy

Player receives ONE driver reroll and ONE car reroll.

Hard

No rerolls.

The player must accept whatever they receive.

It should be impossible to repeatedly press Roll to circumvent these restrictions.

ERA SELECTION

Preserve the dual-ended era slider.

The player can independently adjust the earliest and latest allowed season.

For example:

1987 — 2006

Only driver-season and car-season cards inside that range can then be rolled.

Do NOT replace this with decade buttons.

DRIVER & CAR CARDS

Every entry represents a specific season.

Therefore:

Michael Schumacher 2000

and

Michael Schumacher 2004

are different collectible cards with different ratings.

The same applies to cars.

Long F1 careers should naturally create many versions of the same driver.

This is intentional and is an important part of the collection mechanic.

RATINGS

Drivers contain:

Overall

Pace

Consistency

Racecraft

Cars contain:

Overall

Pace

Reliability

Tyres

Driver Overall + Car Overall creates the headline package rating out of 200.

200/200 should effectively never occur because even the greatest historical drivers/cars are not considered literally perfect.

A 190+ combination should feel frightening.

Around 180–189 should have serious championship potential.

Around 160 should feel midfield.

Very weak combinations should have extremely small championship chances.

OPPONENT GENERATION

This is particularly important.

Do NOT generate an entire grid of strong midfield/elite opponents.

We specifically corrected this during prototype development.

The generated field should have meaningful dispersion:

Some terrible combinations

Backmarkers

Lower midfield

Midfield

Strong combinations

A small number of genuine championship threats

Opponents must not secretly reroll until they receive good combinations.

They should participate in the same alternate-history randomness as the player.

SHINY SYSTEM

Any driver or car can roll as a Shiny.

Current probability:

2% / approximately 1 in 50.

Shiny status does NOT improve performance.

It is purely collectible.

A shiny should feel special.

Give shiny cards a beautiful holographic/foil presentation and satisfying reveal animation, but do not make ordinary cards visually boring.

A player can own:

Normal Schumacher 2004

Shiny Schumacher 2004

as separate collection discoveries.

Preserve shiny collection progress.

FORMULA ARCHIVE

This is the collection area.

The supplied database currently contains more than 1,000 normal driver/car season cards, with shiny variants effectively doubling the collection hunt.

Undiscovered cards should remain mysterious.

The archive should eventually feel closer to a premium digital sticker book/trading-card collection than a database table.

Make it easy to browse on mobile.

Useful filtering/searching is encouraged.

Do not remove obscure or terrible drivers/cars. Pulling something awful is part of the fun.

ACHIEVEMENTS

Preserve every achievement and its exact trigger from the prototype.

Some achievements are visible and some are SECRET.

Secret achievements should NOT reveal their name, description or unlock condition until unlocked.

Achievement unlocks should produce a satisfying popup/toast.

Examples include:

World Champion

God Tier

Oh Dear...

HOW?!

Shiny!

Double Shiny

Holy Grail

Dream Team

Heartbreak

Pain.

Perfect Season

Dominant

Dragging It Along

Collector

Archivist

Touch Grass

There are also secret achievements already implemented in the prototype.

Do not expose those secret triggers in the UI.

CAREER

Preserve persistent statistics including:

Seasons completed

Championships

Race wins

Podiums

DNFs

Shinies discovered

Best combination

Perfect seasons

RUN HISTORY

Preserve the most recent 20 completed seasons.

Each entry should show:

Championship position

Driver + season

Car + season

Shiny status

Combined rating

Points

Wins

Podiums

DNFs

Pre-season predicted/paper ranking

Championship-winning runs should be visually highlighted.

UX / SCREEN STRUCTURE

This should feel like an app/game, NOT one long scrolling webpage.

Use distinct screens/views.

Suggested flow:

HOME

→ Start Season
→ Formula Archive
→ Career / Achievements

START SEASON

→ Difficulty + Era on the SAME screen
→ Driver Roll
→ Car Roll
→ Combination
→ Generated Grid
→ Season Simulation
→ Championship Result

At the end of a season provide:

Roll Again

Home

Achievements/Career

Navigation must always allow the player to return home.

Screens may vertically scroll on smaller phones when required. Never allow content to be clipped simply because the viewport is short.

VISUAL DIRECTION

I want Formula Archive to feel like a premium motorsport game.

Dark interface.

Black / charcoal / deep navy foundation.

Motorsport red as a major accent.

Controlled use of electric blue, purple, warm orange/gold and subtle gradients/glows.

Do NOT turn it into a neon casino.

Think:

Motorsport + archive + premium trading cards + modern sports game UI.

Strong typography.

Large ratings.

Beautiful card presentation.

Subtle motion.

Fast transitions.

Tactile buttons.

Excellent mobile experience.

Shiny cards can be much more colourful/holographic than ordinary cards because finding one should be a special event.

Avoid excessive glassmorphism and generic AI/SaaS dashboard styling.

It should look like a game, not business software.

MOBILE FIRST

I primarily test/play this on a phone.

Mobile usability is extremely important.

Specifically:

No clipped screens

No vertically wrapped OVR text

No inaccessible buttons

No tiny controls

Tables must work properly on narrow displays

Safe areas should work on iPhone

Each screen may scroll vertically when required

Era slider must remain easy to manipulate

Desktop/tablet should also look excellent.

PERSISTENCE

The existing prototype uses localStorage.

For the initial rebuild, retaining local persistence is acceptable.

Architect the application so a future backend/account system and cloud save can be introduced without rewriting the core game.

Do NOT require login for the initial version.

ARCHITECTURE

Rebuild the prototype into sensible reusable components and separate game data/logic from presentation.

The simulation engine should not be buried inside UI components.

Driver/car data should live separately from rendering code.

Achievement definitions and triggers should be maintainable.

Persistence should have a clear abstraction so local storage can later be replaced/supplemented by cloud saves.

VERY IMPORTANT

Do not remove features simply to make the first rebuild easier.

Do not replace the game mechanics with placeholder logic.

Do not invent completely new mechanics yet.

Do not simplify the historical database.

Do not reveal secret achievements.

Do not change shiny odds.

Do not change the established simulation balance without asking.

Do not use copyrighted Formula 1 logos, team logos, driver photographs or other protected visual assets at this stage.

Generic motorsport-inspired visual design is fine.

FIRST DELIVERABLE

Build a functional polished version of the supplied game.

Before adding any new gameplay features, make sure the complete existing gameplay loop works from:

Home → Setup → Driver → Car → Combination → Grid → Simulation → Result → Career/Archive → New Season

Test that repeated seasons work without refreshing the application.

Test both Easy and Hard modes.

Test narrow mobile layouts.

Test persistence after reload.

Once the existing game is faithfully rebuilt and polished, stop there so I can test it before we add anything else.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://f1-archive-legends.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8ad6f4b6-6b63-4f9e-b927-71f460249015).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
