## Azure Pipelines YAML Authoring

This repository is a thin consumer of the shared template library at `SandboxServers/Azure-Pipeline-YAML` (resource alias `pipelinePatterns`).

### Error checking
After editing `azure-pipelines.yml` or any file under `pipeline/variables/`, always call `get_errors` on the modified file. The Azure Pipelines LSP is active on all pipeline files. Treat any LSP errors as blocking.

### Pipeline conventions
- `azure-pipelines.yml` is intentionally thin — triggers, PR config, parameters, variables, resources, and `extends` only; no inline steps or jobs
- All build/test/package/security/release logic lives in the shared template
- Queue-time parameters declared here use `type: stringList` for multi-select (e.g. `environments`) or `type: boolean` / `type: string` for single values; the shared template receives `stringList` as `type: object`
- New queue-time parameters must be declared in the `parameters:` block AND passed through in the `extends.parameters:` block
- Variable files under `pipeline/variables/` are loaded by shared template jobs via `globalVariableTemplatePath` and `buildVariableTemplatePath` — not by the root pipeline
