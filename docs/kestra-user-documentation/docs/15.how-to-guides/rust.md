---
title: Run Rust inside of your Flows
icon: /docs/icons/rust.svg
stage: Getting Started
topics:
  - Scripting
---

Run Rust code directly inside of your Flows and generate outputs.

Rust has jumped in popularity over the past few years, mainly due to its performance and reliability in production settings. Compared to Python, Rust is a great choice for performance-critical workloads so might be a good choice to use in your flows.

This guide is going to walk you through how to get Rust running inside of a workflow, how to manage input and output files, and how you can pass outputs and metrics back to Kestra to use in later tasks.

## Executing Rust inside Kestra

There isn't an official Rust plugin but we can use the `Shell` `Commands` task to execute arbitrary commands inside of a Docker container. We can also specify a container image that contains the necessary libraries to run the specific programming language.

In this example, we're using the Docker Task Runner with the `rust:latest` image so that Rust code can be executed.

```yaml
id: rust_commands
namespace: company.team
tasks:
  - id: rust
    type: io.kestra.plugin.scripts.shell.Commands
    taskRunner:
      type: io.kestra.plugin.scripts.runner.docker.Docker
    containerImage: rust:latest
    namespaceFiles:
      enabled: true
    commands:
      - rustc main.rs && ./main
```

The contents of the `main.rs` file contains a simple print statement:

```rust
fn main() {
    println!("Hello World");
}
```

You'll need to add your Rust code using the built-in Editor or [using our Git plugin](../version-control-cicd/04.git.md) so Kestra can see it.  You'll also need to set the `enabled` flag for the `namespaceFiles` property to `true` so Kestra can access the file.

You can also add your Rust code inline using the `inputFiles` property.

```yaml
id: rust_commands
namespace: company.team
tasks:
  - id: rust
    type: io.kestra.plugin.scripts.shell.Commands
    taskRunner:
      type: io.kestra.plugin.scripts.runner.docker.Docker
    containerImage: rust:latest
    inputFiles:
      main.rs: |
        fn main() {
          println!("Hello World!");
        }
    commands:
      - rustc main.rs && ./main
```

You can read more about the Shell Commands type in the [Plugin documentation](/plugins/plugin-script-shell/tasks/io.kestra.plugin.scripts.shell.commands).

## Handling Outputs

Your Rust code can generate file-based [outputs](../04.workflow-components/06.outputs.md).

In your Rust code, write a file to the local directory. Then, use the `outputFiles` property to point Kestra to the path of those [output files](../04.workflow-components/01.tasks/02.scripts/06.outputs-metrics.md).

In this example, `output.txt` file containing the text "Hello World" is written to the local directory. To read that output file in another downstream task, you can use the syntax `{{ outputs.{task_id}.outputFiles['<filename>'] }}`, and if you need a file's content as a string rather than a file path, you can wrap that expression in a `read()` function e.g. `{{ read(outputs.mytask.outputFiles['outputs.txt']) }}`.

```yaml
id: rust_script
namespace: company.team

tasks:
  - id: rust
    type: io.kestra.plugin.scripts.shell.Commands
    taskRunner:
      type: io.kestra.plugin.scripts.runner.docker.Docker
    containerImage: rust:latest
    inputFiles:
      main.rs: |
        use std::fs::File;
        use std::io::Write; // For the `write_all` method

        fn main() -> std::io::Result<()> {
            // Create or open the file `output.txt` in write mode
            let mut file = File::create("output.txt")?;

            // Write the string "Hello, World" to the file
            file.write_all(b"Hello World")?;

            // Confirm successful write operation
            println!("Successfully wrote to the file.");

            Ok(())
        }
    outputFiles:
      - output.txt
    commands:
      - rustc main.rs && ./main

  - id: read_file
    type: io.kestra.plugin.core.log.Log
    message: "{{ read(outputs.rust.outputFiles['output.txt']) }}"
```

## Orchestrate with Rust

Rust is a great choice for performance-critical workloads. If you're working with huge datasets, Rust could be a good choice for ETL. Below is an example of how you can setup Rust inside of Kestra to perform an ETL process.

The example flow uses a Rust image created using the following [sample ETL project](https://github.com/kestra-io/examples/tree/main/examples/rust). The image contains the CLI command `etl` to allow us to start the process.

```yaml
id: rust_in_container
namespace: company.team

tasks:
  - id: rust
    type: io.kestra.plugin.scripts.shell.Commands
    taskRunner:
      type: io.kestra.plugin.scripts.runner.docker.Docker
    containerImage: ghcr.io/kestra-io/rust:latest
    outputFiles:
      - "*.csv"
    commands:
      - etl
```

Once the container finishes execution, you'll be able to download all CSV files generated by the Rust container from the Outputs tab. Kestra makes it easy to both process heavy compute workloads while providing an intuitive interface to access the results.

::alert{type="info"}
Note that the `ghcr.io/kestra-io/rust:latest` image is public, so you can directly use the example shown above and give it a try.
::