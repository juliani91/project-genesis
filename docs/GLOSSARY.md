# Glossary

This document defines the terminology used throughout Project Genesis. These definitions are the canonical reference for contributors, template authors, and AI assistants.

---

# Architecture

## Domain Model

A TypeScript model that represents a business concept within Project Genesis.

Examples:

- TemplatePackage
- TemplateManifest
- Wizard

---

## Service

A component responsible for orchestrating business operations.

Services coordinate work between models, loaders, generators, and validators.

Services should not directly perform file I/O unless that responsibility belongs to them.

---

## Loader

A component responsible for loading a descriptor from disk and converting it into a domain model.

Examples:

- WizardLoader
- ManifestLoader
- FolderLoader

Each loader has a single responsibility.

---

## Generator

A component responsible for creating output during project generation.

Generators never define project structure—they execute a generation plan.

---

## Validator

A component responsible for validating descriptors, templates, or generated output.

Validators report problems but do not modify data.

---

# Templates

## Template

A reusable project definition that can be instantiated by Project Genesis.

A template is composed of multiple descriptors and supporting resources.

---

## Template Package

A complete template loaded into memory.

A Template Package progressively gains information as descriptors are loaded.

Example:

- Manifest
- Wizard
- Folder Definition
- README
- Features

---

## Descriptor

A configuration file that describes one aspect of a template.

Examples:

- genesis.json
- wizard.json
- folders.json

Descriptors define the template—they are not generated output.

---

## Manifest

The descriptor that identifies a template.

It contains metadata such as:

- Name
- Version
- Description
- Category
- Author

The manifest is the minimum information required to discover a template.

---

## Wizard

A descriptor that defines the information required from the user before generating a project.

The wizard describes the required data, not the user interface.

---

## Field

A single input requested by the wizard.

Examples:

- Project Name
- Client Name
- Description
- Tech Stack

---

# Generation

## Generation Pipeline

The sequence of steps required to create a new project.

Typical stages include:

1. Discover Template
2. Load Descriptors
3. Collect Variables
4. Validate Inputs
5. Generate Output

---

## Enrichment

The process of creating a new Template Package by adding additional information.

Example:

Template Package

↓

Template Package + Wizard

↓

Template Package + Folder Definition

↓

Template Package + README

Enrichment never mutates the original object.

---

## Generation Plan

An in-memory representation of the work required to generate a project.

Generators execute a Generation Plan.

---

# Documentation

## ADR (Architecture Decision Record)

A document describing an important architectural decision, why it was made, and its consequences.

ADRs explain the reasoning behind the architecture.

---

## Specification

A document that defines a contract or standard.

Specifications describe what must be implemented rather than how it is implemented.