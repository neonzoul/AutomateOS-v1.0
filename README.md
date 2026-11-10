# AutomateOS v1.0

> **I stopped asking AI to write more code, and started asking how the whole project should work.**

**Archived — no longer maintained.**

AutomateOS v1.0 was a second attempt at building a visual workflow automation platform.

The product idea was still familiar: a visual builder where people could create, share, and run automated workflows.

But the experiment had changed.

I was becoming less interested in how quickly AI could generate features and more interested in whether an entire project could be structured so AI could work inside it consistently.

## What this project explored

AutomateOS v1.0 became a monorepo containing experiments around:

- visual workflow building
- shared workflow schemas
- API contracts
- orchestration and execution
- frontend/backend boundaries
- reusable packages
- Docker-based development
- automated testing and CI
- project documentation
- persistent instructions for AI coding assistants

The repository included dedicated instructions for Claude and GitHub Copilot describing architecture, coding conventions, testing expectations, security rules, UX principles, and where different kinds of code should live.

Today this sounds fairly normal.

At the time, I was experimenting with a different way of working:

instead of explaining the project to an AI every time, make the repository itself carry enough context for the AI to understand how it should work.

## What I got wrong

The project was often more architecturally ambitious than the product required.

Some services existed because they seemed like the correct future architecture rather than because the current system had proven they were necessary.

Documentation sometimes described the intended system more clearly than the implemented one.

And many “rules” were still just instructions written in Markdown rather than constraints enforced by software.

Those limitations are visible throughout the repository.

I am leaving them visible.

## Why it is public

This repository documents a shift in how I approached AI-assisted development.

The question was no longer simply:

**“Can AI build this feature?”**

It had become:

**“Can I design the environment in which AI builds?”**

AutomateOS v1.0 was my attempt to answer that question with the tools and understanding I had at the time.

---

**Status:** Archived  
**Period:** September–October 2025  
**Maintenance:** None planned  
**Production use:** Not recommended  
**Purpose:** Historical experiment in AI-assisted software architecture
